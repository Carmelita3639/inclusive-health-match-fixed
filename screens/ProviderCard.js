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

/**
 * Utility helpers
 */
function tidyStr(v) {
  if (v == null) return '';
  return String(v).trim();
}

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(x => tidyStr(x)).filter(Boolean);
  return tidyStr(v)
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

function capitalize(w) {
  if (!w) return '';
  const low = String(w).toLowerCase();
  return low.charAt(0).toUpperCase() + low.slice(1);
}

function buildChipsFromClaimedProfile(cp) {
  if (!cp) return [];

  const chips = [];

  // gender
  if (cp.gender) chips.push(capitalize(cp.gender));

  // languages (array or comma list)
  toArray(cp.languages).forEach((lang) => chips.push(capitalize(lang)));

  // cultural identifiers (comma list)
  toArray(cp.cultural_identifiers).forEach((id) => chips.push(id));

  // special flags
  if (cp.lgbtq_affirming) chips.push('LGBTQ+ affirming');
  if (cp.board_certified) chips.push('Board certified');

  return chips;
}

/**
 * 1. Merge raw nppes row w/ claimed profile
 * 2. Return normalized object for UI
 */
function mergeProviderData(nppesRow, claimedProfileRow) {
  if (!nppesRow && !claimedProfileRow) return null;

  // build name
  // claimed preferred: first_name + last_name
  const first = claimedProfileRow?.first_name || '';
  const last = claimedProfileRow?.last_name || '';
  const claimedName = [first, last].filter(Boolean).join(' ');

  const fallbackName =
    claimedProfileRow?.full_name ||
    nppesRow?.full_name ||
    'Unknown Provider';

  const fullName = (claimedName || fallbackName).toUpperCase();

  // specialty
  const specialty =
    claimedProfileRow?.specialty ||
    claimedProfileRow?.speciality || // sometimes spelled this way in your mock
    nppesRow?.primary_taxonomy_desc ||
    nppesRow?.taxonomy_description ||
    nppesRow?.specialty ||
    '';

  // address
  const addrLine1 =
    claimedProfileRow?.practice_address_1 ||
    claimedProfileRow?.address ||
    nppesRow?.practice_address_1 ||
    '';

  const addrLine2 =
    claimedProfileRow?.practice_address_2 ||
    nppesRow?.practice_address_2 ||
    '';

  const city =
    claimedProfileRow?.practice_city ||
    nppesRow?.practice_city ||
    '';

  const state =
    claimedProfileRow?.practice_state ||
    nppesRow?.practice_state ||
    '';

  const zip =
    claimedProfileRow?.practice_zip ||
    nppesRow?.practice_zip ||
    '';

  const addressFull = [addrLine1, addrLine2, city, state, zip]
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ','); // cleanup double commas

  // contact
  const phone =
    claimedProfileRow?.phone ||
    nppesRow?.phone ||
    '';

  const email = claimedProfileRow?.email || '';

  // bio / about
  const bio = tidyStr(claimedProfileRow?.bio);

  // verified == has claimed profile
  const verified = !!claimedProfileRow;

  // chips
  const chips = buildChipsFromClaimedProfile(claimedProfileRow);

  return {
    npi: nppesRow?.npi || claimedProfileRow?.npi || null,
    fullName,
    specialty,
    address: addressFull,
    phone,
    email,
    bio,
    verified,
    claimedProfile: claimedProfileRow || null,
    chips,
  };
}

/**
 * ProviderCard screen with pull-to-refresh + live fetch
 */
export default function ProviderCard() {
  const navigation = useNavigation();
  const route = useRoute();

  // We expect either:
  // - route.params.npi (preferred)
  // - or route.params.provider { npi, ... } from search screen
  const initialNpi =
    route.params?.npi ||
    route.params?.provider?.npi ||
    route.params?.provider?.NPI || // in case field is capitalized in mock
    null;

  const [data, setData] = useState(
    route.params?.provider
      ? // if we were passed in a pre-merged version from search UI,
        // try to normalize it into same shape so screen doesn't flash empty
        {
          npi:
            route.params.provider.npi ||
            route.params.provider.NPI ||
            null,
          fullName:
            route.params.provider.fullName ||
            route.params.provider.full_name ||
            route.params.provider.name ||
            '',
          specialty:
            route.params.provider.specialty ||
            route.params.provider.speciality ||
            route.params.provider.taxonomy_description ||
            '',
          address:
            route.params.provider.address ||
            '',
          phone:
            route.params.provider.phone ||
            '',
          email:
            route.params.provider.email ||
            '',
          bio:
            route.params.provider.profileData?.bio ||
            '',
          verified:
            !!route.params.provider.verified ||
            !!route.params.provider.claimed ||
            !!route.params.provider.profileData,
          chips: buildChipsFromClaimedProfile(
            route.params.provider.profileData
          ),
          claimedProfile: route.params.provider.profileData || null,
        }
      : null
  );

  const [refreshing, setRefreshing] = useState(false);

  // helper to load latest from Supabase
  const loadFromSupabase = useCallback(
    async (npiToFetch) => {
      if (!npiToFetch) return;

      try {
        const fresh = await getProviderByNpi(npiToFetch);
        // fresh = { nppesRow, claimedProfileRow } from providers.js
        const merged = mergeProviderData(
          fresh.nppesRow,
          fresh.claimedProfileRow
        );
        if (merged) {
          setData(merged);
        } else {
          // no record?
          Alert.alert(
            'Not found',
            'We could not load that provider record.'
          );
        }
      } catch (err) {
        console.error('loadFromSupabase error:', err);
        Alert.alert(
          'Error',
          'Could not refresh provider details.'
        );
      }
    },
    []
  );

  // run once on mount if we weren't passed pre-merged data
  useEffect(() => {
    if (!data && initialNpi) {
      loadFromSupabase(initialNpi);
    }
  }, [data, initialNpi, loadFromSupabase]);

  // pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    if (!initialNpi) return;
    setRefreshing(true);
    await loadFromSupabase(initialNpi);
    setRefreshing(false);
  }, [initialNpi, loadFromSupabase]);

  if (!data) {
    // super basic loading state while we fetch
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
    verified,
    chips,
    npi,
    claimedProfile,
  } = data;

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePrimaryAction = () => {
    if (verified && claimedProfile) {
      navigation.navigate('UpdateProfile', {
        provider: data,
      });
    } else {
      navigation.navigate('ClaimProfile', {
        npi,
        provider: data,
      });
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
          <Ionicons
            name="close-outline"
            size={28}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Provider Profile
        </Text>

        {/* right side spacer to balance layout */}
        <View style={{ width: 28 }} />
      </View>

      {/* Scrollable Content with Pull-To-Refresh */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BLUE}
          />
        }
      >
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.nameText}>{fullName}</Text>

          {/* VERIFIED BADGE */}
          {verified && (
            <View style={styles.verifiedRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={GREEN}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* SPECIALTY */}
          {!!specialty && (
            <View style={styles.lineRow}>
              <Ionicons
                name="medkit-outline"
                size={18}
                color={GRAY_700}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.lineLabel}>
                  Specialty:{' '}
                  <Text style={styles.lineValue}>{specialty}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* BIO / ABOUT */}
          {!!bio && (
            <View style={[styles.lineRow, { marginTop: 12 }]}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={GRAY_700}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.bioText}>{bio}</Text>
              </View>
            </View>
          )}

          {/* PHONE */}
          {!!phone && (
            <View style={styles.lineRow}>
              <Ionicons
                name="call-outline"
                size={18}
                color={GRAY_700}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.lineValue}>{phone}</Text>
            </View>
          )}

          {/* ADDRESS */}
          {!!address && (
            <View style={styles.lineRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={GRAY_700}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.lineValue}>{address}</Text>
            </View>
          )}

          {/* EMAIL */}
          {!!email && (
            <View style={styles.lineRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={GRAY_700}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.lineValue}>{email}</Text>
            </View>
          )}

          {/* CHIPS */}
          {!!chips?.length && (
            <View style={styles.chipsWrap}>
              {chips.map((chipText, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{chipText}</Text>
                </View>
              ))}
            </View>
          )}

          {/* PRIMARY ACTION BUTTON */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePrimaryAction}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {verified ? 'Update Profile' : 'Claim Profile'}
            </Text>
          </TouchableOpacity>

          {/* NOTE */}
          <Text style={styles.noteText}>
            Only the provider who claimed this profile can
            {verified ? ' update ' : ' claim '}it.
          </Text>
        </View>

        {/* Small spacer bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: BLUE,
    paddingTop: 50, // safe-ish for notch
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginHorizontal: 8,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

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

  nameText: {
    color: GRAY_900,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 28,
  },

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
    marginBottom: 16,
  },

  verifiedText: {
    color: GRAY_700,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },

  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },

  lineLabel: {
    color: GRAY_700,
    fontSize: 16,
    fontWeight: '700',
    flexWrap: 'wrap',
  },

  lineValue: {
    color: GRAY_700,
    fontSize: 16,
    fontWeight: '400',
    flexShrink: 1,
    flexWrap: 'wrap',
  },

  bioText: {
    color: GRAY_700,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },

  chip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  chipText: {
    color: GRAY_700,
    fontWeight: '600',
    fontSize: 13,
  },

  primaryBtn: {
    backgroundColor: BLUE_DARK,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  noteText: {
    color: GRAY_600,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  loadingWrap: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingText: {
    color: GRAY_600,
    fontSize: 16,
    fontWeight: '600',
  },
});
