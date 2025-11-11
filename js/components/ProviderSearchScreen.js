// js/components/ProviderSearchScreen.js
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Data
import { searchProvidersByName } from '../lib/providers';

// Colors
const BLUE = '#2563EB';
const GREEN = '#10B981';
const GRAY_900 = '#111827';
const GRAY_700 = '#374151';
const GRAY_500 = '#6B7280';
const FIELD_BG = '#F3F4F6';

export default function ProviderSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // ---- form state ----
  const [name, setName] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');

  // ---- results state ----
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState([]);
  const listRef = useRef(null);

  const canSearch = useMemo(() => name.trim().length > 0, [name]);

  const onClear = () => {
    setName('');
    setStateFilter('');
    setSpecialty('');
    setLanguage('');
    setGender('');
    setResults([]);
    setErrorMsg('');
  };

  const onSearch = async () => {
    Keyboard.dismiss();
    if (!canSearch) {
      setErrorMsg('Please enter a name to search.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setResults([]);
    try {
      const providers = await searchProvidersByName({
        name: name.trim(),
        state: stateFilter.trim(),
        specialty: specialty.trim(),
        language: language.trim(),
        gender: gender.trim(),
      });
      setResults(providers || []);
      requestAnimationFrame(() =>
        listRef.current?.scrollToOffset({ offset: 0, animated: true })
      );
    } catch (e) {
      setErrorMsg(
        typeof e?.message === 'string' ? e.message : 'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- UI bits ----
  const HeaderBanner = () => (
    <View
      style={[
        styles.banner,
        { paddingTop: Math.max(insets.top + 6, 14) }, // below Dynamic Island
      ]}
    >
      <Text style={styles.bannerTitle}>Provider Search</Text>
    </View>
  );

  const Form = () => (
    <View style={styles.form}>
      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g., Audrey Durrant"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCapitalize="words"
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />

      {/* State */}
      <Text style={styles.label}>State (e.g., NY)</Text>
      <TextInput
        value={stateFilter}
        onChangeText={setStateFilter}
        placeholder="NY"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCapitalize="characters"
        maxLength={2}
      />

      {/* Specialty */}
      <Text style={styles.label}>Specialty (e.g., Pediatrics)</Text>
      <TextInput
        value={specialty}
        onChangeText={setSpecialty}
        placeholder="Pediatrics"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      {/* Language */}
      <Text style={styles.label}>Language (optional)</Text>
      <TextInput
        value={language}
        onChangeText={setLanguage}
        placeholder="English"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      {/* Gender */}
      <Text style={styles.label}>Gender (M or F)</Text>
      <TextInput
        value={gender}
        onChangeText={setGender}
        placeholder="F"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        maxLength={1}
        autoCapitalize="characters"
      />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onSearch}
          disabled={!canSearch || loading}
          style={[styles.searchBtn, !canSearch && { opacity: 0.6 }]}
        >
          {loading ? (
            <View style={styles.searchingWrap}>
              <ActivityIndicator />
              <Text style={styles.searchText}> Searching…</Text>
            </View>
          ) : (
            <Text style={styles.searchText}>Search</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {/* Results summary */}
      {results.length > 0 && !loading && !errorMsg ? (
        <Text style={styles.summaryText}>
          Found {results.length} provider(s). Tap a card or use the buttons to view or claim.
        </Text>
      ) : null}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No results yet.</Text>
    </View>
  );

  const Pill = ({ children }) => (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );

  const ResultCard = ({ item }) => {
    const isVerified =
      !!(item?.claimed_profile?.bio && (item?.claimed_profile?.competencies?.length || 0) > 0);

    const openCard = () => {
      navigation.navigate('ProviderCard', { provider: item });
    };

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={openCard}>
        <View style={styles.card}>
          {/* email */}
          {!!item?.email && (
            <View style={styles.emailRow}>
              <Text style={styles.emailText}>{item.email}</Text>
            </View>
          )}

          {/* chips */}
          <View style={styles.pillsRow}>
            {!!item?.gender && <Pill>{item.gender}</Pill>}
            {!!item?.language && <Pill>{item.language}</Pill>}
            {!!item?.race && <Pill>{item.race}</Pill>}
            {!!item?.ethnicity && <Pill>{item.ethnicity}</Pill>}
            {item?.lgbtq_affirming ? <Pill>LGBTQ+ affirming</Pill> : null}
            {item?.board_certified ? <Pill>Board certified</Pill> : null}
          </View>

          {/* row with verified + CTAs */}
          <View style={styles.ctaRow}>
            <View style={styles.verifiedWrap}>
              <View
                style={[
                  styles.verifiedDot,
                  { backgroundColor: isVerified ? GREEN : '#D1D5DB' },
                ]}
              />
              <Text
                style={[styles.verifiedText, { color: isVerified ? GRAY_900 : GRAY_500 }]}
              >
                {isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>

            <TouchableOpacity style={styles.outlineBtn} onPress={openCard}>
              <Text style={styles.outlineText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                navigation.navigate('ProviderCard', {
                  provider: item,
                  openClaim: !isVerified,
                })
              }
            >
              <Text style={styles.primaryText}>
                {isVerified ? 'Update Profile' : 'Claim Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <HeaderBanner />
      <FlatList
        ref={listRef}
        data={results}
        keyExtractor={(row, i) =>
          String(row?.npi || row?.NPI || row?.email || i)
        }
        ListHeaderComponent={<Form />}
        renderItem={ResultCard}
        ListEmptyComponent={!loading && !errorMsg ? EmptyState : null}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' ? 28 + insets.bottom : 28,
        }}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Banner
  banner: {
    width: '100%',
    backgroundColor: BLUE,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  bannerTitle: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 24,
    textAlign: 'center',
  },

  // Form
  form: { paddingHorizontal: 20, paddingTop: 16 },
  label: {
    color: GRAY_900,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: FIELD_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: GRAY_900,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  searchBtn: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingWrap: { flexDirection: 'row', alignItems: 'center' },
  searchText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  clearBtn: {
    width: 130,
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  clearText: { color: '#065F46', fontWeight: '700', fontSize: 16 },
  errorText: { color: '#DC2626', marginTop: 12, fontSize: 15, fontWeight: '600' },
  summaryText: {
    color: GRAY_700,
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty
  empty: { paddingHorizontal: 20, paddingVertical: 28 },
  emptyText: { color: GRAY_500, fontSize: 16, textAlign: 'center' },

  // Result Card
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  emailText: { fontSize: 16, color: GRAY_900, fontWeight: '600' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  pillText: { color: GRAY_900, fontWeight: '700' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  verifiedWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 'auto' },
  verifiedDot: { width: 10, height: 10, borderRadius: 5 },
  verifiedText: { fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  outlineText: { color: BLUE, fontWeight: '800' },
  primaryBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryText: { color: '#FFF', fontWeight: '800' },
});
