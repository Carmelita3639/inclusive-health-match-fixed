import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

// ---- colors ----
const BLUE = '#2563EB';
const BLUE_600 = '#1D4ED8';
const GREEN = '#10B981';
const GREEN_SOFT = '#D1FAE5';
const GRAY_900 = '#111827';
const GRAY_700 = '#374151';
const GRAY_600 = '#4B5563';
const GRAY_500 = '#6B7280';
const GRAY_300 = '#D1D5DB';
const GRAY_200 = '#E5E7EB';
const CARD_BG = '#FFFFFF';
const BG = '#F7F8FA';

// fallback sample rows if Supabase/network fails
function getMockProviders() {
  return [
    {
      npi: '1528265279',
      full_name: 'DR. JOELLE PIERRE',
      gender: 'F',
      primary_taxonomy_desc: 'Pediatric Surgery, General Surgery',
      phone: '215-427-4067',
      practice_address_1: '160 E ERIE AVE',
      practice_city: 'PHILADELPHIA',
      practice_state: 'PA',
      practice_zip: '19134',
      profileData: {
        first_name: 'JOELLE',
        last_name: 'PIERRE',
        speciality: 'Pediatric Surgery, General Surgery',
        phone: '215-427-4067',
        address:
          '160 E ERIE AVE, PHILADELPHIA, PA 19134',
        is_verified: true,
        board_certified: true,
        lgbtq_affirming: true,
        languages: ['English', 'Spanish'],
        cultural_identifiers:
          'Black, African-American',
        bio: '',
        email: 'carmelita3639@gmail.com',
        gender: 'Female',
      },
    },
  ];
}

// --- helper to normalize + merge Supabase results ---
function stitchResults({ claimedRows, registryRows }) {
  const byNpi = {};

  // claimed_provider_profiles wins
  claimedRows.forEach((row) => {
    const npi = row.npi;
    byNpi[npi] = {
      npi,
      full_name: row.full_display_name || '',
      gender: row.gender || row.gender_identity || '',
      specialty: row.speciality || row.specialty || row.specialities || row.specialities_text || row.speciality_text || row.specialities_other || row.specialty_other || row.specialities_input || row.specialties || row.specialties_text || row.specialties_other || row.specialties_input || row.speciality_text || row.specialty_text || row.speciality_other || row.specialty_other || row.speciality_input || row.specialty_input || row.specialty,
      taxonomy_description: row.speciality || row.specialty || '',
      phone: row.phone || '',
      address: row.address || '',
      addresses: [
        {
          address_1: row.address || '',
          city: row.city || '',
          state: row.state || '',
          postal_code: row.zip || '',
        },
      ],
      profileData: {
        ...row,
        is_verified: true,
      },
    };
  });

  // Fill in nppes_registry if npi not already taken
  registryRows.forEach((row) => {
    const npi = row.npi;
    if (!byNpi[npi]) {
      const addrParts = [
        row.practice_address_1,
        row.practice_city,
        row.practice_state,
        row.practice_zip,
      ]
        .filter(Boolean)
        .join(', ');

      byNpi[npi] = {
        npi,
        full_name: row.full_name || '',
        gender: row.gender || '',
        specialty: row.primary_taxonomy_desc || '',
        taxonomy_description:
          row.primary_taxonomy_desc || '',
        phone: row.phone || '',
        address: addrParts,
        addresses: [
          {
            address_1: row.practice_address_1,
            address_2: row.practice_address_2,
            city: row.practice_city,
            state: row.practice_state,
            postal_code: row.practice_zip,
          },
        ],
        profileData: null,
      };
    }
  });

  return Object.values(byNpi);
}

export default function ProviderSearchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // form state
  const [name, setName] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');

  // ui state
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedNpi, setSelectedNpi] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const onClear = useCallback(() => {
    setName('');
    setStateVal('');
    setSpecialty('');
    setLanguage('');
    setGender('');
    setRows([]);
    setSelectedNpi(null);
    setNetworkError(false);
  }, []);

  const onSearch = useCallback(async () => {
    // no filters at all? warn
    if (
      !name.trim() &&
      !stateVal.trim() &&
      !specialty.trim() &&
      !gender.trim() &&
      !language.trim()
    ) {
      Alert.alert(
        'Search Required',
        'Enter at least one filter (name, state, etc.).'
      );
      return;
    }

    setLoading(true);
    setSelectedNpi(null);
    setNetworkError(false);

    console.log('🔎 Merged provider search with filters:', {
      name,
      state: stateVal,
      specialty,
      gender,
      language,
    });

    try {
      // 1. claimed_provider_profiles
      let claimQ = supabase
        .from('claimed_provider_profiles')
        .select(
          `
          npi,
          full_display_name,
          first_name,
          last_name,
          gender,
          gender_identity,
          speciality,
          specialty,
          phone,
          address,
          city,
          state,
          zip,
          bio,
          email,
          lgbtq_affirming,
          board_certified,
          languages,
          cultural_identifiers
        `
        )
        .limit(50);

      if (name.trim()) {
        claimQ = claimQ.ilike(
          'full_display_name',
          `%${name.trim()}%`
        );
      }
      if (stateVal.trim()) {
        claimQ = claimQ.eq(
          'state',
          stateVal.trim().toUpperCase()
        );
      }
      if (specialty.trim()) {
        claimQ = claimQ.ilike(
          'speciality',
          `%${specialty.trim()}%`
        );
      }
      if (gender.trim()) {
        claimQ = claimQ.ilike(
          'gender',
          `%${gender.trim()}%`
        );
      }
      if (language.trim()) {
        // languages is text now; just ilike
        claimQ = claimQ.ilike(
          'languages',
          `%${language.trim()}%`
        );
      }

      const { data: claimedRows, error: claimedErr } =
        await claimQ;

      if (claimedErr) {
        console.log(
          '[fetchClaimedProviders] error:',
          claimedErr
        );
      }

      // 2. nppes_registry
      let regQ = supabase
        .from('nppes_registry')
        .select(
          `
          npi,
          full_name,
          gender,
          primary_taxonomy_desc,
          phone,
          practice_address_1,
          practice_address_2,
          practice_city,
          practice_state,
          practice_zip
        `
        )
        .limit(50);

      if (name.trim()) {
        regQ = regQ.ilike(
          'full_name',
          `%${name.trim()}%`
        );
      }
      if (stateVal.trim()) {
        regQ = regQ.eq(
          'practice_state',
          stateVal.trim().toUpperCase()
        );
      }
      if (specialty.trim()) {
        regQ = regQ.ilike(
          'primary_taxonomy_desc',
          `%${specialty.trim()}%`
        );
      }
      if (gender.trim()) {
        regQ = regQ.eq(
          'gender',
          gender.trim().toUpperCase()
        );
      }
      // language not in registry, ignore

      const { data: registryRows, error: regErr } =
        await regQ;

      if (regErr) {
        console.log(
          '[fetchNppesProviders] error:',
          regErr
        );
      }

      // if both errored or unreachable -> show mock + banner
      if (claimedErr && regErr) {
        console.log(
          '💥 both queries failed, offline fallback'
        );
        setNetworkError(true);
        setRows(getMockProviders());
      } else {
        const stitched = stitchResults({
          claimedRows: claimedRows || [],
          registryRows: registryRows || [],
        });
        setRows(stitched);
        if (stitched.length === 0) {
          console.log(
            'ℹ️ no matches after merge'
          );
        }
      }
    } catch (err) {
      console.log(
        '💥 onSearch threw exception:',
        err
      );
      setNetworkError(true);
      setRows(getMockProviders());
    } finally {
      setLoading(false);
    }
  }, [
    name,
    stateVal,
    specialty,
    gender,
    language,
  ]);

  // tap a card header to "select"
  const toggleSelect = (npi) => {
    setSelectedNpi((prev) =>
      prev === npi ? null : npi
    );
  };

  // Build stable payload we pass to ProviderCard / UpdateProfile
  function buildProviderPayload(item) {
    const cp = item.profileData || null;
    const claimed = !!cp;
    const verified = !!cp?.is_verified;

    const fullNameFromProfile =
      cp?.first_name || cp?.last_name
        ? [cp.first_name, cp.last_name]
            .filter(Boolean)
            .join(' ')
            .toUpperCase()
        : null;

    const fullName =
      fullNameFromProfile ||
      item.full_name?.toUpperCase() ||
      '';

    const sp =
      cp?.speciality ||
      item.specialty ||
      item.taxonomy_description ||
      '';

    const phone = cp?.phone || item.phone || '';
    const address =
      cp?.address || item.address || '';
    const email = cp?.email || '';

    return {
      npi: item.npi ?? null,
      fullName,
      specialty: sp,
      phone,
      address,
      email,
      gender:
        cp?.gender ||
        cp?.gender_identity ||
        item.gender ||
        '',
      languages:
        cp?.languages ||
        [],
      cultural_identifiers:
        cp?.cultural_identifiers || '',
      board_certified:
        !!cp?.board_certified,
      lgbtq_affirming:
        !!cp?.lgbtq_affirming,
      bio: cp?.bio || '',

      claimed,
      verified,

      profileData: cp,
    };
  }

  // Card renderer
  const renderItem = ({ item }) => {
    const isSelected =
      selectedNpi === item.npi;
    const payload = buildProviderPayload(
      item
    );
    const verified =
      !!payload.verified ||
      !!payload.claimed;

    // actions
    const goViewDetails = () => {
      if (!payload.npi) {
        Alert.alert(
          'Error',
          'Missing provider NPI.'
        );
        return;
      }
      try {
        navigation.navigate('ProviderCard', {
          provider: payload,
        });
      } catch (err) {
        console.warn(
          'ProviderCard nav error:',
          err
        );
        Alert.alert(
          'Coming Soon',
          'Provider details page is coming soon!'
        );
      }
    };

    const goPrimaryAction = () => {
      if (!payload.npi) {
        Alert.alert(
          'Error',
          'Missing provider NPI.'
        );
        return;
      }
      try {
        navigation.navigate(
          'UpdateProfile',
          { provider: payload }
        );
      } catch (err) {
        console.warn(
          'UpdateProfile nav error:',
          err
        );
        Alert.alert(
          'Feature Not Available',
          'This feature is coming soon.'
        );
      }
    };

    // chip pills
    const chips = buildChips({
      gender: payload.gender,
      languages: payload.languages,
      cultural_identifiers:
        payload.cultural_identifiers,
      lgbtq_affirming:
        payload.lgbtq_affirming,
      board_certified:
        payload.board_certified,
    });

    return (
      <View
        style={[
          styles.card,
          isSelected &&
            styles.selectedCard,
        ]}
      >
        {/* Select header */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() =>
            toggleSelect(item.npi)
          }
          style={[
            styles.selectableArea,
            {
              backgroundColor: isSelected
                ? '#E8F2FF'
                : '#F9F9F9',
            },
          ]}
        >
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.cardName,
                isSelected &&
                  styles.selectedName,
              ]}
            >
              {payload.fullName ||
                'UNKNOWN PROVIDER'}
            </Text>
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={BLUE}
              />
            )}
          </View>

          {!isSelected && (
            <Text
              style={styles.tapHint}
            >
              TAP TO SELECT
            </Text>
          )}
        </TouchableOpacity>

        {/* body */}
        <View
          style={styles.detailsContainer}
        >
          {!!payload.specialty && (
            <InfoLine
              icon="medkit-outline"
              text={
                <>
                  <Text
                    style={{
                      fontWeight: '700',
                    }}
                  >
                    Specialty:{' '}
                  </Text>
                  {payload.specialty}
                </>
              }
            />
          )}

          {!!payload.phone && (
            <InfoLine
              icon="call-outline"
              text={payload.phone}
            />
          )}

          {!!payload.address && (
            <InfoLine
              icon="location-outline"
              text={payload.address}
            />
          )}

          {!!chips.length && (
            <View
              style={styles.chipsWrap}
            >
              {chips}
            </View>
          )}
        </View>

        {/* footer buttons */}
        <View style={styles.footerRow}>
          <View style={styles.leftFooter}>
            {verified && (
              <View
                style={styles.verifiedPill}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={GREEN}
                />
                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verified
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rightFooter}>
            <TouchableOpacity
              onPress={goViewDetails}
              style={[
                styles.smallBtn,
                styles.btnSecondary,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.secondaryBtnText
                }
              >
                View Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goPrimaryAction}
              style={[
                styles.smallBtn,
                verified
                  ? styles.btnBlue
                  : styles.btnGreen,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.smallBtnText
                }
              >
                {verified
                  ? 'Update Profile'
                  : 'Claim Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const showResultsHeader =
    !loading && rows.length > 0;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 0 : 0
        }
      >
        {/* Top banner */}
        <View
          style={[
            styles.topBlue,
            { paddingTop: insets.top + 14 },
          ]}
        >
          <Text style={styles.topTitle}>
            Provider Search
          </Text>
        </View>

        {/* Network / fallback notice */}
        {networkError && (
          <View
            style={styles.errorBanner}
          >
            <Ionicons
              name="warning-outline"
              size={20}
              color="#DC2626"
            />
            <Text
              style={styles.errorText}
            >
              Network issue - showing
              sample data
            </Text>
          </View>
        )}

        {/* Search filters */}
        <View style={{ padding: 16 }}>
          <LabeledInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Joelle Pierre"
          />
          <LabeledInput
            label="State (e.g., FL)"
            value={stateVal}
            onChangeText={setStateVal}
            autoCapitalize="characters"
            maxLength={2}
          />
          <LabeledInput
            label="Specialty (e.g., Pediatrics)"
            value={specialty}
            onChangeText={setSpecialty}
          />
          <LabeledInput
            label="Language (optional)"
            value={language}
            onChangeText={setLanguage}
          />
          <LabeledInput
            label="Gender (M or F)"
            value={gender}
            onChangeText={setGender}
            autoCapitalize="characters"
            maxLength={1}
          />

          {/* Buttons row */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.searchBtn,
                loading && {
                  opacity: 0.7,
                },
              ]}
              onPress={onSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={
                    styles.searchText
                  }
                >
                  Search
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={onClear}
              disabled={loading}
            >
              <Text
                style={styles.clearText}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results helper text */}
        {showResultsHeader && (
          <Text
            style={styles.resultsInfo}
          >
            Found {rows.length}{' '}
            provider
            {rows.length === 1
              ? ''
              : 's'}
            . Tap a card to
            select, then use
            the buttons to
            view or claim that
            profile.
          </Text>
        )}

        {/* Results list */}
        <FlatList
          data={rows}
          keyExtractor={(item) =>
            String(item.npi)
          }
          renderItem={renderItem}
          contentContainerStyle={
            styles.listContent
          }
          extraData={selectedNpi}
          ListEmptyComponent={
            !loading ? (
              <Text
                style={
                  styles.emptyText
                }
              >
                {rows.length === 0
                  ? 'No results yet. Try searching for a provider.'
                  : ''}
              </Text>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

/* subcomponents + helpers */

const LabeledInput = ({ label, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.inputLabel}>
      {label}
    </Text>
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor={GRAY_500}
      autoCorrect={false}
    />
  </View>
);

function InfoLine({ icon, text }) {
  return (
    <View style={styles.line}>
      <Ionicons
        name={icon}
        size={16}
        color={GRAY_600}
      />
      <Text style={styles.lineText}>
        {text}
      </Text>
    </View>
  );
}

function Chip({ children }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>
        {children}
      </Text>
    </View>
  );
}

function buildChips({
  gender,
  languages,
  cultural_identifiers,
  lgbtq_affirming,
  board_certified,
}) {
  const chips = [];

  if (gender) {
    chips.push(
      <Chip key="gender">
        {capitalize(gender)}
      </Chip>
    );
  }

  if (languages) {
    // languages is text currently, not JSON
    const arr = Array.isArray(
      languages
    )
      ? languages
      : String(languages || '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

    arr.forEach((lang, i) => {
      chips.push(
        <Chip
          key={`lang-${i}`}
        >
          {capitalize(lang)}
        </Chip>
      );
    });
  }

  if (cultural_identifiers) {
    String(cultural_identifiers)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p, i) => {
        chips.push(
          <Chip
            key={`cult-${i}`}
          >
            {p}
          </Chip>
        );
      });
  }

  if (lgbtq_affirming) {
    chips.push(
      <Chip key="lgbtq">
        LGBTQ+ affirming
      </Chip>
    );
  }
  if (board_certified) {
    chips.push(
      <Chip key="board">
        Board certified
      </Chip>
    );
  }

  return chips;
}

function capitalize(s) {
  if (!s) return '';
  const lower = String(s).toLowerCase();
  return (
    lower.charAt(0).toUpperCase() +
    lower.slice(1)
  );
}

/* styles */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  topBlue: {
    backgroundColor: BLUE,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },

  inputLabel: {
    color: GRAY_700,
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GRAY_300,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: GRAY_900,
    fontSize: 15,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  searchBtn: {
    flex: 1,
    backgroundColor: BLUE_600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  searchText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  clearBtn: {
    width: 100,
    backgroundColor: '#10B98122',
    borderColor: GREEN,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: GREEN,
    fontWeight: '800',
    fontSize: 15,
  },

  resultsInfo: {
    paddingHorizontal: 16,
    color: GRAY_600,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  emptyText: {
    color: GRAY_500,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY_200,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  selectableArea: {
    minHeight: 50,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selectedCard: {
    borderColor: BLUE,
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardName: {
    color: GRAY_900,
    fontWeight: '900',
    fontSize: 16,
    flex: 1,
  },

  selectedName: {
    color: BLUE,
  },

  tapHint: {
    color: GRAY_500,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  detailsContainer: {
    marginBottom: 8,
  },

  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  lineText: {
    marginLeft: 8,
    color: GRAY_700,
    fontSize: 14,
    flex: 1,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: GRAY_200,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    color: GRAY_700,
    fontSize: 12,
    fontWeight: '600',
  },

  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_SOFT,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  verifiedText: {
    marginLeft: 4,
    color: GRAY_700,
    fontWeight: '700',
    fontSize: 12,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  leftFooter: {
    flex: 1,
  },

  rightFooter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnGreen: { backgroundColor: GREEN },
  btnBlue: { backgroundColor: BLUE_600 },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: GRAY_300,
  },
  smallBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryBtnText: {
    color: GRAY_600,
    fontWeight: '800',
    fontSize: 13,
  },
});
