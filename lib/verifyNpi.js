// lib/verifyNpi.js

export async function verifyNpiAgainstNppes(npi, firstName, lastName) {
    try {
      if (!npi) {
        return { ok: false, reason: 'No NPI entered' };
      }
  
      const qs = new URLSearchParams({
        version: '2.1',
        number: npi,
        enumeration_type: 'NPI-1',
        limit: '1',
      });
  
      const url = `https://npiregistry.cms.hhs.gov/api/?${qs.toString()}`;
      console.log('🔎 Verifying NPI with NPPES:', url);
  
      const resp = await fetch(url);
      if (!resp.ok) {
        return { ok: false, reason: 'NPPES lookup failed' };
      }
  
      const data = await resp.json();
      if (!data.results || data.results.length === 0) {
        return { ok: false, reason: 'No provider found for that NPI' };
      }
  
      const provider = data.results[0];
  
      const nppesFirst = (provider.basic?.first_name || '').trim().toUpperCase();
      const nppesLast  = (provider.basic?.last_name  || '').trim().toUpperCase();
  
      const localFirst = (firstName || '').trim().toUpperCase();
      const localLast  = (lastName  || '').trim().toUpperCase();
  
      const nameMatches =
        nppesFirst === localFirst &&
        nppesLast === localLast;
  
      if (!nameMatches) {
        return {
          ok: false,
          reason: `Name mismatch. NPPES has ${nppesFirst} ${nppesLast}`,
          nppesFirst,
          nppesLast,
        };
      }
  
      return { ok: true, nppes: provider };
    } catch (err) {
      console.log('❌ verifyNpiAgainstNppes error:', err);
      return { ok: false, reason: 'Unexpected error during NPI verification' };
    }
  }
  