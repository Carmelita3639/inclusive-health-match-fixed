// js/lib/providers.js
// Robust NPPES-by-name search via your Supabase Edge Function proxy.
// Extends timeout and removes aggressive aborts that produced “Search cancelled”.

const EDGE_URL =
  'https://aojmwbwaoprdjjqroza.supabase.co/functions/v1/nppes_proxy'; // <— your edge func base

// Helper: build query params only if provided
const qp = (label, val) => (val ? `&${label}=${encodeURIComponent(val)}` : '');

export async function searchProvidersByName({ name, state, specialty, language, gender }) {
  // name -> split to first/last best effort
  const [first = '', ...rest] = name.trim().split(/\s+/);
  const last = rest.join(' ');

  // Construct URL
  const url =
    `${EDGE_URL}?first=${encodeURIComponent(first)}${qp('last', last)}` +
    `${qp('state', state)}${qp('specialty', specialty)}${qp('language', language)}${qp('gender', gender)}`;

  // Prefer fetch with a generous timeout (25s), but don’t abort unless truly needed.
  const TIMEOUT_MS = 25000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('Request timed out'), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`NPPES proxy error: ${res.status} ${text || res.statusText}`);
    }
    const data = await res.json();

    // Normalize a minimal shape used by ResultCard (keep what you actually render)
    const normalized =
      Array.isArray(data?.results)
        ? data.results.map((r) => ({
            // safely pull fields from either NPPES or your enrichment
            full_name: r.full_name || [r.first_name, r.last_name].filter(Boolean).join(' '),
            email: r.email || r.contact_email || '',
            gender: r.gender || '',
            language: r.language || '',
            race: r.race || '',
            ethnicity: r.ethnicity || '',
            lgbtq_affirming: !!r.lgbtq_affirming,
            board_certified: !!r.board_certified,
            claimed_profile: r.claimed_profile || null,
            raw: r, // keep original in case ProviderCard needs it
          }))
        : [];

    return normalized;
  } catch (err) {
    // If aborted, show a friendly message instead of “cancelled”
    if (err?.name === 'AbortError') {
      throw new Error('The NPPES search is taking longer than expected. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
