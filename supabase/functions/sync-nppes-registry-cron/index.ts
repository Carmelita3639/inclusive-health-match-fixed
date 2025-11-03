// supabase/functions/sync-nppes-registry-cron/index.ts
//
// 1. Read list of (state, city, limit_per_city) from public.sync_targets
// 2. For each city, hit NPPES API for NPI-1 individuals
// 3. Upsert into public.nppes_registry via PostgREST with service role key
//
// This is meant to run on a schedule. No Authorization header needed from caller.
// It skips duplicates using ON CONFLICT (npi).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Pull secrets from Edge Function environment
const SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
const PROJECT_URL = Deno.env.get("SB_URL");

if (!SERVICE_ROLE_KEY || !PROJECT_URL) {
  console.error("Missing SB_SERVICE_ROLE_KEY or SB_URL in function secrets");
}

// --- helpers ---

async function fetchSyncTargets() {
  // GET all active targets from public.sync_targets
  // Columns we expect: state (e.g. "NY"), city (e.g. "Brooklyn"), limit_per_city (e.g. 50), active (true)
  const url = `${PROJECT_URL}/rest/v1/sync_targets?select=*&active=eq.true`;

  const resp = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!resp.ok) {
    console.error("Failed to fetch sync_targets", resp.status, await resp.text());
    return [];
  }

  return await resp.json();
}

function pickPracticeAddress(addresses: any[]) {
  if (!addresses || !addresses.length) return null;
  // prefer practice location
  const practice = addresses.find(
    (a) => a.address_purpose?.toLowerCase() === "practice",
  );
  return practice ?? addresses[0];
}

function pickPrimaryTaxonomy(taxonomies: any[]) {
  if (!taxonomies || !taxonomies.length) return null;
  const primary = taxonomies.find((t) => t.primary);
  return primary ?? taxonomies[0];
}

function epochToIso(epoch: number | undefined | null) {
  if (!epoch) return null;
  // NPPES gives epoch seconds usually (10 digits). Convert to ms for JS Date.
  const ms = epoch.toString().length === 10 ? epoch * 1000 : epoch;
  return new Date(ms).toISOString();
}

// map one NPPES provider result into nppes_registry row
function mapNppesToRegistryRow(p: any) {
  const addr = pickPracticeAddress(p.addresses);
  const tax = pickPrimaryTaxonomy(p.taxonomies);

  const full_name = [
    p.basic?.first_name ?? "",
    p.basic?.last_name ?? "",
  ]
    .join(" ")
    .trim()
    .toUpperCase();

  return {
    npi: p.number?.toString() ?? null,
    enumeration_type: p.enumeration_type ?? null,
    full_name,
    gender: p.basic?.gender ?? null,

    practice_address_1: addr?.address_1 ?? null,
    practice_address_2: addr?.address_2 ?? null,
    practice_city: (addr?.city ?? "").toUpperCase() || null,
    practice_state: (addr?.state ?? "").toUpperCase() || null,
    practice_zip: addr?.postal_code ?? null,
    phone: addr?.telephone_number ?? null,

    primary_taxonomy_code: tax?.code ?? null,
    primary_taxonomy_desc: tax?.desc ?? null,

    created_at_raw: epochToIso(p.created_epoch),
    last_updated_raw: epochToIso(p.last_updated_epoch),

    last_updated: new Date().toISOString(), // internal bookkeeping
  };
}

// upsert array of provider rows into public.nppes_registry
async function upsertProviders(rows: any[]) {
  if (!rows.length) {
    return { inserted: 0 };
  }

  const url =
    `${PROJECT_URL}/rest/v1/nppes_registry?on_conflict=npi`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!resp.ok) {
    const bodyText = await resp.text();
    console.error("Upsert error:", resp.status, bodyText);
    return { error: bodyText };
  }

  return { inserted: rows.length };
}

// pull NPI-1 individuals for (state, city)
async function syncCity(state: string, city: string, limit: number) {
  const qs = new URLSearchParams({
    version: "2.1",
    state,
    city,
    enumeration_type: "NPI-1",
    limit: String(limit),
  });

  const nppesUrl = `https://npiregistry.cms.hhs.gov/api/?${qs.toString()}`;
  const resp = await fetch(nppesUrl);

  if (!resp.ok) {
    const t = await resp.text();
    console.error("NPPES fetch failed", resp.status, t);
    return {
      state,
      city,
      synced: 0,
      result_count: 0,
      source_url: nppesUrl,
      note: "NPPES fetch failed",
    };
  }

  const data = await resp.json();
  const results = data.results ?? [];

  // Transform & keep only NPI-1
  const rows = results
    .filter((r: any) => r.enumeration_type === "NPI-1")
    .map(mapNppesToRegistryRow);

  // Push to DB
  const upsertRes = await upsertProviders(rows);

  return {
    state,
    city,
    synced: rows.length,
    result_count: data.result_count ?? rows.length,
    upsertRes,
    source_url: nppesUrl,
  };
}

serve(async (_req: Request) => {
  try {
    // 1. Get all sync targets from DB
    const targets = await fetchSyncTargets();
    console.log("Sync targets:", targets);

    const results: any[] = [];
    for (const t of targets) {
      const limit = t.limit_per_city ?? 50;
      const res = await syncCity(t.state, t.city, limit);
      results.push(res);
    }

    // 2. Sum how many providers we just synced
    const totalSynced = results.reduce(
      (sum, r) => sum + (r.synced ?? 0),
      0,
    );

    return new Response(
      JSON.stringify(
        {
          ran_at: new Date().toISOString(),
          targets: results,
          total_synced: totalSynced,
        },
        null,
        2,
      ),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("CRON sync failed:", err);
    return new Response(
      JSON.stringify({
        error: "cron sync failed",
        details: String(err),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
