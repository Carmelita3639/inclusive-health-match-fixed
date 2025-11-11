// js/lib/aiMatchEngine.js
import supabase, { supabase as namedClient } from '../supabase.js';
import { searchNppes } from './nppes';
import { parseUserQuery } from './parseQuery';
import { SPECIALTY_TO_TAXONOMY } from './specialtyTaxonomy';

// handle either default or named export just in case
const db = supabase || namedClient;
const norm = (x) => (x ?? '').toString().trim();

export async function aiMatchSearch({
  prompt,
  city = '',
  state = '',
  language = '',
  specialty = '',
  gender = '',
  limit = 20,
}) {
  // --- 1) parse free text
  const parsed = parseUserQuery(prompt || '');

  const g = gender
    ? gender.toLowerCase().startsWith('f')
      ? 'f'
      : gender.toLowerCase().startsWith('m')
      ? 'm'
      : ''
    : parsed.gender;

  const specialtyLower = (specialty || '').toLowerCase();
  const detectedSpecialty = specialtyLower || parsed.specialtyHit || '';
  const taxonomy =
    SPECIALTY_TO_TAXONOMY[detectedSpecialty] || parsed.taxonomy || '';

  // --- 2) claimed first (Supabase)
  let claimed = [];
  try {
    let q = db.from('claimed_provider_profiles').select('*').limit(limit);

    if (detectedSpecialty) q = q.ilike('speciality', `%${detectedSpecialty}%`);
    if (g) q = q.ilike('gender', g === 'f' ? '%f%' : '%m%');
    if (state) q = q.eq('state', state.toUpperCase());
    if (city) q = q.ilike('city', `%${city}%`);
    if (language) q = q.or(`languages.ilike.%${language}%`);

    const { data, error } = await q;
    if (error) throw error;
    claimed = Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[aiMatchSearch] Supabase claimed query failed:', err?.message || err);
    claimed = [];
  }

  const claimedNorm = claimed.map((c) => ({
    source: 'claimed',
    ...c,
    is_verified: !!c.is_verified,
    full_display_name:
      norm(c.full_display_name) ||
      [norm(c.first_name), norm(c.last_name)].filter(Boolean).join(' '),
  }));

  // --- 3) NPPES backfill if needed
  const need = Math.max(0, limit - claimedNorm.length);
  let nppesRows = [];
  if (need > 0) {
    try {
      const fetched = await searchNppes({
        taxonomy,
        gender: g,
        city,
        state,
        limit: Math.min(need * 2, 40),
      });
      nppesRows = (fetched || []).map((r) => ({
        source: 'nppes',
        npi: r.npi || r.number,
        full_display_name: norm(r.full_name) || norm(r.name),
        is_verified: false,
      }));
    } catch (err) {
      console.warn('[aiMatchSearch] NPPES search failed:', err?.message || err);
      nppesRows = [];
    }
  }

  // --- 4) dedupe by NPI (prefer claimed)
  const claimedMap = new Map(claimedNorm.map((r) => [r.npi, r]));
  const backfill = [];
  for (const n of nppesRows) {
    const npi = n?.npi;
    if (!npi) continue;
    if (claimedMap.has(npi)) continue;
    backfill.push(n);
    if (claimedNorm.length + backfill.length >= limit) break;
  }

  // --- 5) final order
  const rank = (r) => {
    if (r.source === 'claimed' && r.is_verified) return `0-${r.full_display_name}`;
    if (r.source === 'claimed') return `1-${r.full_display_name}`;
    return `2-${r.full_display_name}`;
  };

  return [...claimedNorm, ...backfill].sort((a, b) => rank(a).localeCompare(rank(b)));
}

export default aiMatchSearch;
