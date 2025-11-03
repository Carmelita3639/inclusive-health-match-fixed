// js/nppes-service.js
export async function searchNppesProviders({ firstName, lastName, state, specialty, language, gender }) {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (firstName) params.append('first_name', firstName);
    if (lastName) params.append('last_name', lastName);
    if (state) params.append('state', state);
    if (gender) params.append('gender', gender);
    params.append('enumeration_type', 'NPI-1'); // only individuals
    params.append('limit', '10');
    params.append('version', '2.1');

    const url = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;
    console.log('[NPPES API] Request:', url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();

    if (!json.results) {
      console.log('[NPPES API] No results returned.');
      return [];
    }

    const providers = json.results.map((r) => {
      const basic = r.basic || {};
      const practice = r.addresses?.find(a => a.address_purpose === 'LOCATION') || {};
      const taxonomy = r.taxonomies?.[0] || {};

      return {
        npi: r.number,
        full_name: `${basic.first_name || ''} ${basic.last_name || ''}`.trim(),
        gender: basic.gender || '',
        phone: practice.telephone_number || '',
        address: `${practice.address_1 || ''}, ${practice.city || ''}, ${practice.state || ''} ${practice.postal_code || ''}`,
        taxonomy_description: taxonomy.desc || '',
        primary_taxonomy_desc: taxonomy.desc || '',
      };
    });

    console.log(`[NPPES API] Found ${providers.length} providers`);
    return providers;
  } catch (error) {
    console.error('[NPPES API] Error:', error);
    return [];
  }
}
