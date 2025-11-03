// js/lib/providers.js

// we will reuse your existing supabase client config
import { supabase } from '../supabase';

/**
 * fetch claimed profile row from claimed_provider_profiles for an NPI
 */
async function fetchClaimedProfile(npi) {
  const { data, error } = await supabase
    .from('claimed_provider_profiles')
    .select(
      `
        npi,
        verified,
        first_name,
        last_name,
        credentials,
        specialty,
        bio,
        phone,
        email,
        gender,
        languages,
        cultural_identifiers,
        lgbtq_affirming,
        board_certified
      `
    )
    .eq('npi', npi)
    .maybeSingle(); // returns null instead of throwing if not found

  if (error) {
    console.log('[fetchClaimedProfile] error:', error);
  }

  return data || null;
}

/**
 * fetch base provider row from nppes_registry for an NPI
 */
async function fetchRegistryProvider(npi) {
  const { data, error } = await supabase
    .from('nppes_registry')
    .select(
      `
        npi,
        full_name,
        gender,
        phone,
        practice_address_1,
        practice_address_2,
        practice_city,
        practice_state,
        practice_zip,
        primary_taxonomy_desc,
        primary_taxonomy_code
      `
    )
    .eq('npi', npi)
    .maybeSingle();

  if (error) {
    console.log('[fetchRegistryProvider] error:', error);
  }

  return data || null;
}

/**
 * merge logic:
 * - take registry row (public NPPES data)
 * - overlay claimed profile (provider-updated data)
 * - shape it exactly like ProviderCard expects
 */
export async function getProviderByNpi(npi) {
  // grab both in parallel
  const [registry, claimed] = await Promise.all([
    fetchRegistryProvider(npi),
    fetchClaimedProfile(npi),
  ]);

  if (!registry && !claimed) {
    return null;
  }

  // figure out display name
  // preferred: claimed first_name + last_name + credentials
  // fallback: registry.full_name
  let displayName = '';
  if (claimed?.first_name || claimed?.last_name) {
    const cred = claimed?.credentials ? `, ${claimed.credentials}` : '';
    displayName = `${claimed.first_name ?? ''} ${claimed.last_name ?? ''}${cred}`
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  } else if (registry?.full_name) {
    displayName = registry.full_name.toUpperCase();
  } else {
    displayName = 'UNKNOWN PROVIDER';
  }

  // specialty
  const specialty =
    claimed?.specialty ||
    registry?.primary_taxonomy_desc ||
    null;

  // address
  const addressParts = [
    registry?.practice_address_1,
    registry?.practice_address_2,
    registry?.practice_city,
    registry?.practice_state,
    registry?.practice_zip,
  ].filter(Boolean);

  const address = addressParts.join(', ');

  // languages can be array or string in DB
  let languagesClean = [];
  if (Array.isArray(claimed?.languages)) {
    languagesClean = claimed.languages;
  } else if (typeof claimed?.languages === 'string') {
    languagesClean = claimed.languages
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  // chip-style tags for ProviderCard
  // we'll hand ProviderCard pre-shaped chip data so UI stays simple
  const chips = [];

  // gender
  if (claimed?.gender) {
    chips.push(claimed.gender);
  } else if (registry?.gender) {
    chips.push(registry.gender === 'F' ? 'Female' :
               registry.gender === 'M' ? 'Male' :
               registry.gender);
  }

  // languages
  languagesClean.forEach(lang => chips.push(lang));

  // cultural identifiers
  if (claimed?.cultural_identifiers) {
    const cultures = Array.isArray(claimed.cultural_identifiers)
      ? claimed.cultural_identifiers
      : String(claimed.cultural_identifiers)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

    cultures.forEach(c => chips.push(c));
  }

  // lgbtq affirming
  if (claimed?.lgbtq_affirming) {
    chips.push('LGBTQ+ affirming');
  }

  // board certified
  if (claimed?.board_certified) {
    chips.push('Board certified');
  }

  // build final payload
  return {
    // identity
    npi,
    displayName,
    verified: !!claimed?.verified,

    // clinical
    specialty,
    bio: claimed?.bio || null,

    // contact
    phone: claimed?.phone || registry?.phone || null,
    email: claimed?.email || null,
    address,

    // chips for UI
    chips,
  };
}
