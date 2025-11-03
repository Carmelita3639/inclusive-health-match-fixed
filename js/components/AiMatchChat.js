// js/components/AiMatchChat.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMergedProviders } from '../lib/providerData';

const GREEN_BG = '#0F766E';
const GREEN = '#10B981';
const GREEN_SOFT = '#D1FAE5';
const GRAY_900 = '#111827';
const GRAY_800 = '#1F2937';
const GRAY_700 = '#374151';
const GRAY_600 = '#4B5563';
const GRAY_200 = '#E5E7EB';
const CARD_BG = '#FFFFFF';
const BG = '#F7F8FA';
const BLUE_600 = '#1D4ED8';

export default function AiMatchChat() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [query, setQuery] = useState(
    'Black female pediatric surgeon'
  );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // naive parser to pull what user wants
  async function runMatch() {
    setLoading(true);

    // extremely rough parse:
    // We'll look for words like "black", "female", "pediatric", etc.
    const qLower = query.toLowerCase();

    const genderGuess = qLower.includes('female')
      ? 'F'
      : qLower.includes('male')
      ? 'M'
      : '';

    // We'll pass specialtyGuess into getMergedProviders
    // "pediatric surgeon" -> "Pediatric"
    let specialtyGuess = '';
    if (qLower.includes('pediatric')) {
      specialtyGuess = 'Pediatric';
    } else if (qLower.includes('obgyn')) {
      specialtyGuess = 'Obstetrics';
    } else if (qLower.includes('psychi')) {
      specialtyGuess = 'Psych';
    }

    // name + state are not known here
    try {
      const merged = await getMergedProviders({
        name: '',
        state: '',
        specialty: specialtyGuess,
        gender: genderGuess,
        language: '', // not currently used in providerData.js filters
      });

      // If user said "black" or "african american", filter for those cultural tags
      let filtered = merged;
      if (
        qLower.includes('black') ||
        qLower.includes('african')
      ) {
        filtered = merged.filter((p) => {
          const tags = (
            p.cultural_identifiers || ''
          ).toLowerCase();
          return (
            tags.includes('black') ||
            tags.includes('african')
          );
        });
      }

      setResults(filtered);
    } catch (err) {
      console.log('[AiMatchChat] error:', err);
      Alert.alert(
        'Error',
        'There was an issue finding matches.'
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleUpdateProfile(providerObj) {
    if (!providerObj?.npi) {
      Alert.alert(
        'Error',
        'This provider has no NPI on file. Cannot open Update Profile.'
      );
      return;
    }
    navigation.navigate('UpdateProfile', {
      provider: {
        npi: providerObj.npi,
        fullName: providerObj.fullName || '',
        specialty: providerObj.specialty || '',
        phone: providerObj.phone || '',
        address: providerObj.address || '',
        email: providerObj.email || '',
        gender: providerObj.gender || '',
        languages: providerObj.languages || [],
        cultural_identifiers:
          providerObj.cultural_identifiers || '',
        board_certified: !!providerObj.board_certified,
        lgbtq_affirming: !!providerObj.lgbtq_affirming,
        bio: providerObj.bio || '',
        claimed: !!providerObj.claimed,
        verified: !!providerObj.verified,
        profileData: providerObj.profileDataRaw || {},
      },
    });
  }

  function handleViewDetails(providerObj) {
    if (!providerObj?.npi) {
      Alert.alert(
        'Coming Soon',
        'Provider details require an NPI.'
      );
      return;
    }

    navigation.navigate('ProviderCard', {
      provider: {
        npi: providerObj.npi,
        fullName: providerObj.fullName || '',
        specialty: providerObj.specialty || '',
        phone: providerObj.phone || '',
        address: providerObj.address || '',
        email: providerObj.email || '',
        gender: providerObj.gender || '',
        languages: providerObj.languages || [],
        cultural_identifiers:
          providerObj.cultural_identifiers || '',
        board_certified: !!providerObj.board_certified,
        lgbtq_affirming: !!providerObj.lgbtq_affirming,
        bio: providerObj.bio || '',
        claimed: !!providerObj.claimed,
        verified: !!providerObj.verified,
        profileData: providerObj.profileDataRaw || {},
      },
    });
  }

  function renderProviderCard(p, idx) {
    const chipList = buildChips({
      gender: p.gender,
      languages: p.languages,
      cultural_identifiers: p.cultural_identifiers,
      lgbtq_affirming: p.lgbtq_affirming,
      board_certified: p.board_certified,
    });

    return (
      <View key={p.npi || idx} style={styles.card}>
        <Text style={styles.cardName}>
          {p.fullName || 'UNKNOWN PROVIDER'}
        </Text>

        <View style={styles.chipRow}>
          {chipList}
        </View>

        {/* Specialty */}
        {!!p.specialty && (
          <Line icon="medkit-outline">
            <Text>
              <Text style={styles.bold}>
                Specialty:{' '}
              </Text>
              {p.specialty}
            </Text>
          </Line>
        )}

        {/* Address */}
        {!!p.address && (
          <Line icon="location-outline">
            <Text>{p.address}</Text>
          </Line>
        )}

        {/* Phone */}
        {!!p.phone && (
          <Line icon="call-outline">
            <Text>{p.phone}</Text>
          </Line>
        )}

        {/* Email */}
        {!!p.email && (
          <Line icon="mail-outline">
            <Text>{p.email}</Text>
          </Line>
        )}

        {/* Verified pill */}
        {p.verified && (
          <View
            style={[
              styles.verifiedPill,
              { marginTop: 12 },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={GREEN}
            />
            <Text style={styles.verifiedText}>
              Verified
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => handleViewDetails(p)}
            style={[
              styles.actionBtn,
              styles.btnOutline,
            ]}
          >
            <Text style={styles.btnOutlineText}>
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleUpdateProfile(p)}
            style={[
              styles.actionBtn,
              styles.btnPrimary,
            ]}
          >
            <Text style={styles.btnPrimaryText}>
              Update Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            try {
              navigation.goBack();
            } catch (e) {
              // it's safe if no back stack
            }
          }}
          hitSlop={{
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>
            AI Health Match Assistant
          </Text>
          <Text style={styles.headerSubtitle}>
            Verified profiles appear first.
          </Text>
        </View>
      </View>

      {/* Prompt helper */}
      <View style={styles.coachingBox}>
        <Text style={styles.coachingText}>
          Tell me the competencies you need —{' '}
          <Text style={styles.coachingBold}>
            race/culture, gender, language(s),
            and specialty.
          </Text>
        </Text>
      </View>

      {/* Query quick chip */}
      <View style={styles.quickChip}>
        <Text style={styles.quickChipText}>
          Black female pediatric surgeon
        </Text>
      </View>

      {/* Results list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      >
        {results.map(renderProviderCard)}
      </ScrollView>

      {/* Chat input bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Black female pediatric surgeon..."
          placeholderTextColor={GRAY_600}
          style={styles.inputField}
        />

        <TouchableOpacity
          onPress={() => setQuery('')}
          style={[styles.bottomBtn, styles.clearBtn]}
          disabled={loading}
        >
          <Text style={styles.clearBtnText}>
            Clear
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={runMatch}
          style={[styles.bottomBtn, styles.sendBtn]}
          disabled={loading}
        >
          <Text style={styles.sendBtnText}>
            {loading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* helpers for AiMatchChat UI */

function Line({ icon, children }) {
  return (
    <View style={styles.lineRow}>
      <Ionicons
        name={icon}
        size={18}
        color={GRAY_700}
        style={{ marginRight: 8 }}
      />
      <Text style={styles.lineRowText}>
        {children}
      </Text>
    </View>
  );
}

function Chip({ text }) {
  return (
    <View style={styles.tagChip}>
      <Text style={styles.tagChipText}>
        {text}
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
      <Chip key="g" text={capitalize(gender)} />
    );
  }

  if (languages && Array.isArray(languages)) {
    languages.forEach((lang, i) => {
      if (lang) {
        chips.push(
          <Chip
            key={`lang-${i}`}
            text={capitalize(lang)}
          />
        );
      }
    });
  }

  if (cultural_identifiers) {
    const parts = String(cultural_identifiers)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    parts.forEach((p, i) => {
      chips.push(<Chip key={`c-${i}`} text={p} />);
    });
  }

  if (lgbtq_affirming) {
    chips.push(
      <Chip
        key="lgbtq"
        text="LGBTQ+ affirming"
      />
    );
  }

  if (board_certified) {
    chips.push(
      <Chip
        key="board"
        text="Board certified"
      />
    );
  }

  return chips;
}

function capitalize(s) {
  if (!s) return '';
  const lower = String(s).toLowerCase();
  return (
    lower.charAt(0).toUpperCase() + lower.slice(1)
  );
}

/* styles */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: GREEN_BG,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
  },
  headerSubtitle: {
    color: '#CFFAFE',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  coachingBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  coachingText: {
    color: GRAY_800,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  coachingBold: {
    fontWeight: '700',
  },

  quickChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  quickChipText: {
    color: '#065F46',
    fontSize: 18,
    fontWeight: '700',
  },

  scroll: {
    flex: 1,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY_200,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },

  cardName: {
    color: GRAY_900,
    fontWeight: '900',
    fontSize: 20,
    marginBottom: 12,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  lineRowText: {
    flex: 1,
    color: GRAY_700,
    fontSize: 15,
    lineHeight: 20,
  },

  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_SOFT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  verifiedText: {
    marginLeft: 6,
    color: GRAY_700,
    fontWeight: '700',
    fontSize: 14,
  },

  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: GRAY_200,
  },
  btnOutlineText: {
    color: GRAY_700,
    fontSize: 15,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: GREEN,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  tagChip: {
    backgroundColor: GRAY_200,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagChipText: {
    color: GRAY_700,
    fontSize: 14,
    fontWeight: '700',
  },

  inputBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: GRAY_200,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY_200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: GRAY_900,
    fontSize: 15,
  },

  bottomBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: GREEN,
  },
  clearBtnText: {
    color: GREEN,
    fontWeight: '800',
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: BLUE_600,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
