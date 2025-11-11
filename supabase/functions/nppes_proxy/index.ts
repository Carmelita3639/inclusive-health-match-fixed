// supabase/functions/nppes_proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const npi = url.searchParams.get("npi") ?? "";
    const first = url.searchParams.get("first") ?? "";
    const last = url.searchParams.get("last") ?? "";
    const state = url.searchParams.get("state") ?? "";
    const taxonomy = url.searchParams.get("taxonomy") ?? "";

    // Build NPPES URL
    const nppesUrl =
      `https://npiregistry.cms.hhs.gov/api/?version=2.1` +
      (npi ? `&number=${encodeURIComponent(npi)}` : "") +
      (first ? `&first_name=${encodeURIComponent(first)}` : "") +
      (last ? `&last_name=${encodeURIComponent(last)}` : "") +
      (state ? `&state=${encodeURIComponent(state)}` : "") +
      (taxonomy ? `&taxonomy_description=${encodeURIComponent(taxonomy)}` : "");

    const resp = await fetch(nppesUrl, { redirect: "follow" });
    const json = await resp.json();

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("nppes_proxy error:", e);
    return new Response(JSON.stringify({ error: "proxy_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
