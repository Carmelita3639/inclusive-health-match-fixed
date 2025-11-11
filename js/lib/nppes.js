// js/lib/nppes.js
// Normalized NPPES client used by aiMatchEngine

const BASE = "https://npiregistry.cms.hhs.gov/api/";

export async function searchNppes({ firstName, lastName, taxonomy, gender, city, state, limit = 20 }) {
  const params = new URLSearchParams();
  params.set("version", "2.1");
  params.set("limit", String(limit));
  params.set("enumeration_type", "NPI-1"); // individuals

  if (firstName) params.set("first_name", firstName);
  if (lastName)  params.set("last_name", lastName);
  if (taxonomy)  params.set("taxonomy", taxonomy);
  if (gender)    params.set("gender", gender.toLowerCase()); // 'm' | 'f'
  if (city)      params.set("city", city);
  if (state)     params.set("state", state);

  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`NPPES error ${res.status}`);

  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  // Normalize to the structure aiMatchEngine expects
  return results.map(r => {
    const npi = r.number?.toString();
    const basic = r.basic || {};
    const addr = (r.addresses || []).find(a => a.address_purpose === "LOCATION") || {};
    const tax  = (r.taxonomies || [])[0] || {};

    return {
      source: "nppes",
      npi,
      first_name: basic.first_name || "",
      last_name: basic.last_name || "",
      full_display_name: [basic.first_name, basic.last_name].filter(Boolean).join(" "),
      credentials: basic.credential || "",
      speciality: tax.desc || "",
      phone: addr.telephone_number || "",
      email: "",
      address: [addr.address_1, addr.address_2].filter(Boolean).join(" "),
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.postal_code ? addr.postal_code.substring(0,5) : "",
      gender: (basic.gender || "").toLowerCase(),      // 'm' | 'f'
      languages: "",                                    // NPPES doesn’t reliably expose
      cultural_identifiers: "",
      lgbtq_affirming: false,
      board_certified: Boolean(tax.primary),            // heuristic
      is_verified: false,                               // only true for claimed
      bio: "",
    };
  });
}
