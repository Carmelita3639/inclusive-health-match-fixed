// js/screens/ProviderCard.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getProviderByNpi } from '../lib/providers';
import { useAuth } from '../lib/AuthContext'; // safe optional: if your context exports useAuth()

// --- color tokens to match rest of app ---
const BLUE = '#2563EB';
const BLUE_DARK = '#1D4ED8';
const GREEN = '#10B981';
const GREEN_SOFT = '#D1FAE5';
const GRAY_900 = '#111827';
const GRAY_700 = '#374151';
const GRAY_600 = '#4B5563';
const GRAY_500 = '#6B7280';
const GRAY_300 = '#D1D5DB';
const CARD_BG = '#FFFFFF';
const BG = '#F7F8FA';

/* ---------------- helpers ---------------- */

const tidy = v => (v == null ? '' : String(v).trim());
const toArray = v =>
  !v ? [] : Array.isArray(v) ? v : String(v).split(',').map(x => x.trim()).filter(Boolean);

const cap = w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : '');

function buildChipsFromClaimed(cp) {
  if (!cp) return [];
  const chips = [];
  if (cp.gender) chips.push(cap(String(cp.gender)));
  toArray(cp.languages).forEach(l => chips.push(cap(l)));
  toArray(cp.cultural_identifiers).forEach(x => chips.push(x));
  if (cp.lgbtq_affirming) chips.push('LGBTQ+ affirming');
  if (cp.board_certified) chips.push('Board certified');
  return chips;
}

/**
 * Prefer claimed fields over NPPES and compute "verified" correctly.
 * Verified = claimed AND has bio AND has >=1 competency.
 */
export function deriveDisplay(row) {
  const fromClaimed = row?.source === 'claimed' || !!row?.claimed_by;

  const name =
    tidy(row?.full_display_name) ||
    tidy(row?.full_name) ||
    tidy([row?.first_name, row?.last_name].filter(Boolean).join(' ')) ||
    tidy(row?.basic?.name) ||
    '';

  const specialty =
    row?.speciality ||
    row?.specialty ||
    row?.taxonomy_desc ||
    (Array.isArray(row?.taxonomies) && row.taxonomies[0]?.desc) ||
    tidy(row?.primary_taxonomy_desc) ||
    '';

  const genderRaw = (row?.gender || row?.basic?.gender || '').toString().toLowerCase();
  const gender = genderRaw.startsWith('f') ? 'female' : genderRaw.startsWith('m') ? 'male' : '';

  const phone =
    row?.phone ||
    row?.practice_phone ||
    row?.addresses?.[0]?.telephone_number ||
    row?.address?.telephone_number ||
    null;

  const address =
    row?.address_line ||
    (row?.addresses?.[0]
      ? [
          row.addresses[0].address_1,
          row.addresses[0].address_2,
          `${row.addresses[0].city}, ${row.addresses[0].state} ${row.addresses[0].postal_code}`,
        ]
          .filter(Boolean)
          .join(' ')
      : tidy([row?.practice_address_1, row?.practice_address_2, row?.practice_city, row?.practice_state, row?.practice_zip].filter(Boolean).join(', ')));

  const languages = row?.languages || (Array.isArray(row?.spoken_languages) ? row.spoken_languages : []);
  const hasBio = !!tidy(row?.bio);
  const hasCompetencies = Array.isArray(row?.competencies) && row.competencies.length > 0;
  const isVerified = !!(fromClaimed && hasBio && hasCompetencies);

  return {
    source: fromClaimed ? 'claimed' : 'nppes',
    npi: row?.npi || row?.number || null,
    name: name.toUpperCase(),
    specialty,
    gender,
    phone,
    address,
    email: tidy(row?.email),
    bio: tidy(row?.bio),
    languages,
    competencies: Array.isArray(row?.competencies) ? row.competencies : [],
    isVerified,
    claimedBy: row?.claimed_by || null,
    ethnicity: row?.ethnicity || null,
  };
}

/**
 * Merge a pair { nppesRow, claimedProfileRow } into a single
 * preferred object for UI. If both exist, claimed wins.
 */
function mergePreferred(nppesRow, claimedProfileRow) {
  const chosen =
    claimedProfileRow
      ? { ...nppesRow, ...claimedProfileRow, source: 'claimed' }
      : nppesRow
      ? { ...nppesRow, source: 'nppes' }
      : null;

  if (!chosen) return null;

  const d = deriveDisplay(chosen);
  const chips = buildChipsFromClaimed(claimedProfileRow);

  return {
    npi: d.npi,
    fullName: d.name,
    specialty: d.specialty,
    gender: d.gender,
    phone: d.phone,
    address: d.address,
    email: d.email,
    bio: d.bio,
    chips,
    isVerified: d.isVerified,
    source: d.source,
    claimedBy: d.claimedBy,
    rawClaimed: claimedProfileRow || null,
    rawNppes: nppesRow || null,
  };
}

/* ---------------- Screen ---------------- */

export default function ProviderCard() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = (function safeAuth() {
    try { return useAuth?.() || {}; } catch { return {}; }
  })();

  const initialNpi =
    route.params?.npi ||
    route.params?.provider?.npi ||
    route.params?.provider?.NPI ||
    null;

  // Pre-hydrate from params (nice for quick UI before fetch)
  const [data, setData] = useState(() => {
    const p = route.params?.provider;
    if (!p) return null;

    // If provider already marked as claimed/merged upstream
    if (p.profileData || p.claimed) {
      return mergePreferred(p.rawNppes || p, p.profileData || p.claimedProfileRow || null);
    }
    // Fallback: treat as NPPES-only shape
    return mergePreferred(p, null);
  });

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (npi) => {
    if (!npi) return;
    try {
      const fresh = await getProviderByNpi(npi); // { nppesRow, claimedProfileRow }
      const merged = mergePreferred(fresh?.nppesRow, fresh?.claimedProfileRow);
      if (!merged) {
        Alert.alert('Not found', 'We could not load that provider record.');
        return;
      }
      setData(merged);
    } catch (err) {
      console.error('ProviderCard.load error:', err);
      Alert.alert('Error', 'Could not refresh provider details.');
    }
  }, []);

  useEffect(() => {
    if (!data && initialNpi) load(initialNpi);
  }, [data, initialNpi, load]);

  const onRefresh = useCallback(async () => {
    if (!initialNpi) return;
    setRefreshing(true);
    await load(initialNpi);
    setRefreshing(false);
  }, [initialNpi, load]);

  if (!data) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading provider…</Text>
      </View>
    );
  }

  const {
    fullName,
    specialty,
    phone,
    address,
    email,
    bio,
    chips,
    npi,
    isVerified,
    claimedBy,
    source,
  } = data;

  const handleBack = () => navigation.goBack();

  // CTA rules:
  // - Can Update: this row is claimed and YOU are the owner
  // - Can Claim: row is unclaimed
  const canUpdate = !!(claimedBy && user?.id && claimedBy === user.id);
  const canClaim = !claimedBy;

  const handlePrimary = () => {
    if (canUpdate) {
      navigation.navigate('UpdateProfile', { provider: data });
    } else if (canClaim) {
      navigation.navigate('ClaimProfile', { npi, provider: data });
    }
  };

  return (
    <View style={styles.root}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backRow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-outline" size={28} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>Provider Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />
        }
      >
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.nameText}>{fullName}</Text>

          {/* VERIFIED BADGE (bio + competencies on claimed) */}
          {isVerified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={18} color={GREEN} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* DEV SOURCE INDICATOR (remove before store if desired) */}
          {__DEV__ && (
            <Text style={{ color: GRAY_500, fontSize: 12, marginBottom: 8 }}>
              Source: {source}{claimedBy ? ' · claimed' : ''}
            </Text>
          )}

          {/* SPECIALTY */}
          {!!tidy(specialty) && (
            <View style={styles.lineRow}>
              <Ionicons name="medkit-outline" size={18} color={GRAY_700} style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lineLabel}>
                  Specialty: <Text style={styles.lineValue}>{specialty}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* BIO */}
          {!!tidy(bio) && (
            <View style={[styles.lineRow, { marginTop: 12 }]}>
              <Ionicons name="document-text-outline" size={18} color={GRAY_700} style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bioText}>{bio}</Text>
              </View>
            </View>
          )}

          {/* PHONE */}
          {!!tidy(phone) && (
            <View style={styles.lineRow}>
              <Ionicons name="call-outline" size={18} color={GRAY_700} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.lineValue}>{phone}</Text>
            </View>
          )}

          {/* ADDRESS */}
          {!!tidy(address) && (
            <View style={styles.lineRow}>
              <Ionicons name="location-outline" size={18} color={GRAY_700} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.lineValue}>{address}</Text>
            </View>
          )}

          {/* EMAIL */}
          {!!tidy(email) && (
            <View style={styles.lineRow}>
              <Ionicons name="mail-outline" size={18} color={GRAY_700} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.lineValue}>{email}</Text>
            </View>
          )}

          {/* CHIPS */}
          {!!chips?.length && (
            <View style={styles.chipsWrap}>
              {chips.map((t, i) => (
                <View key={`${t}-${i}`} style={styles.chip}>
                  <Text style={styles.chipText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* PRIMARY CTA */}
          {(canUpdate || canClaim) && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handlePrimary} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>{canUpdate ? 'Update Profile' : 'Claim Profile'}</Text>
            </TouchableOpacity>
          )}

          {/* NOTE */}
          <Text style={styles.noteText}>
            {canUpdate
              ? 'You claimed this profile and can update it.'
              : canClaim
              ? 'Only the provider can claim this profile.'
              : 'This profile is already claimed.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: BLUE,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY_300,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  nameText: { color: GRAY_900, fontSize: 22, fontWeight: '900', marginBottom: 8, lineHeight: 28 },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: GREEN_SOFT,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  verifiedText: { color: GRAY_700, fontWeight: '700', fontSize: 14, marginLeft: 6 },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  lineLabel: { color: GRAY_700, fontSize: 16, fontWeight: '700', flexWrap: 'wrap' },
  lineValue: { color: GRAY_700, fontSize: 16, fontWeight: '400', flexShrink: 1, flexWrap: 'wrap' },
  bioText: { color: GRAY_700, fontSize: 16, lineHeight: 22, flexShrink: 1 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginBottom: 20, gap: 8 },
  chip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipText: { color: GRAY_700, fontWeight: '600', fontSize: 13 },
  primaryBtn: {
    backgroundColor: BLUE_DARK,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  noteText: { color: GRAY_600, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  loadingWrap: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loadingText: { color: GRAY_600, fontSize: 16, fontWeight: '600' },
});
