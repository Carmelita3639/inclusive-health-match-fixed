import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../js/supabase';
import { getProviderByNpi } from '../js/lib/providerData';

// --- colors reused ---
const BLUE = '#2563EB';
const GRAY_900 = '#111827';
const GRAY_700 = '#374151';
const GRAY_600 = '#4B5563';
const GRAY_500 = '#6B7280';
const GRAY_300 = '#D1D5DB';
const CARD_BG = '#FFFFFF';
const BG = '#F7F8FA';

export default function UpdateProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // we expect route.params.npi
  const npiFromParams = route?.params?.npi ?? '';

  // loading / state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState('nppes'); // 'claimed' or 'nppes'

  // editable fields in form
  const [npi, setNpi] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [languages, setLanguages] = useState('');
  const [culturalIdentifiers, setCulturalIdentifiers] = useState('');
  const [lgbtqAffirming, setLgbtqAffirming] = useState('');
  const [boardCertified, setBoardCertified] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip] = useState('');

  // pull canonical data for this npi
  useEffect(() => {
    let active = true;
    async function hydrate() {
      if (!npiFromParams) {
        Alert.alert(
          'Error',
          'No NPI passed to Update Profile screen.'
        );
        navigation.goBack();
        return;
      }

      setLoading(true);

      const { data, error } = await getProviderByNpi(npiFromParams);

      if (!active) return;

      if (error || !data) {
        console.log('hydrate error:', error);
        Alert.alert(
          'Error',
          'Could not load provider data.'
        );
        setLoading(false);
        return;
      }

      // fill form
      setSource(data.source);
      setNpi(data.npi || '');
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setSpeciality(data.speciality || '');
      setBio(data.bio || '');
      setGender(data.gender || '');
      setLanguages(
        data.languages || '' // treat as comma-separated text for now
      );
      setCulturalIdentifiers(
        data.cultural_identifiers || ''
      );
      setLgbtqAffirming(
        data.lgbtq_affirming ? 'yes' : 'no'
      );
      setBoardCertified(
        data.board_certified ? 'yes' : 'no'
      );
      setAddress(data.address || '');
      setCity(data.city || '');
      setStateCode(data.state || '');
      setZip(data.zip || '');

      setLoading(false);
    }

    hydrate();

    return () => {
      active = false;
    };
  }, [npiFromParams, navigation]);

  // SAVE HANDLER
  const handleSave = useCallback(async () => {
    // basic guard: require NPI and first/last
    if (!npi.trim()) {
      Alert.alert(
        'Missing NPI',
        'Please enter your NPI.'
      );
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        'Missing Name',
        'Please enter first and last name.'
      );
      return;
    }

    setSaving(true);

    // map yes/no -> booleans
    const lgbtqBool =
      String(lgbtqAffirming).trim().toLowerCase() === 'yes';
    const boardBool =
      String(boardCertified).trim().toLowerCase() === 'yes';

    // we'll always upsert into claimed_provider_profiles now
    // This means:
    // - If it existed (source === 'claimed'), this is an UPDATE.
    // - If it didn't (source === 'nppes'), this is a CREATE/CLAIM.
    const payload = {
      npi: npi.trim(),
      first_name: firstName.trim().toUpperCase(),
      last_name: lastName.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      speciality: speciality.trim(),
      bio: bio.trim(),
      gender: gender.trim(),
      languages: languages.trim(),
      cultural_identifiers: culturalIdentifiers.trim(),
      lgbtq_affirming: lgbtqBool,
      board_certified: boardBool,
      address: address.trim(),
      city: city.trim(),
      state: stateCode.trim().toUpperCase(),
      zip: zip.trim(),
    };

    console.log('[UpdateProfile] upserting payload:', payload);

    const { data, error } = await supabase
      .from('claimed_provider_profiles')
      .upsert(payload, {
        onConflict: 'npi', // requires unique index on npi
        ignoreDuplicates: false,
      })
      .select()
      .limit(1);

    setSaving(false);

    if (error) {
      console.log('[UpdateProfile] save error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while saving your profile.'
      );
      return;
    }

    console.log('[UpdateProfile] save OK:', data);

    Alert.alert(
      'Success',
      'Profile saved successfully.'
    );

    // after save, pop back to search list (you can tweak this UX)
    navigation.goBack();
  }, [
    npi,
    firstName,
    lastName,
    email,
    phone,
    speciality,
    bio,
    gender,
    languages,
    culturalIdentifiers,
    lgbtqAffirming,
    boardCertified,
    address,
    city,
    stateCode,
    zip,
    navigation,
  ]);

  // UI render
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Blue header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Update Profile
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
          >
            {/* NPI */}
            <SectionLabel text="NPI" />
            <Input
              value={npi}
              onChangeText={setNpi}
              editable={true} // allow correction
            />

            {/* BASIC INFO */}
            <SectionHeader text="Basic Information" />
            <Input
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              placeholder="Specialty"
              value={speciality}
              onChangeText={setSpeciality}
            />

            {/* PROFESSIONAL DETAILS */}
            <SectionHeader text="Professional Details" />
            <MultilineInput
              placeholder="Short professional bio, certifications, focus areas..."
              value={bio}
              onChangeText={setBio}
            />

            {/* IDENTITY & TAGS */}
            <SectionHeader text="Identity & Tags" />
            <Input
              placeholder="Gender"
              value={gender}
              onChangeText={setGender}
            />
            <Input
              placeholder="Languages (comma-separated)"
              value={languages}
              onChangeText={setLanguages}
            />
            <Input
              placeholder="Cultural identifiers (comma-separated)"
              value={culturalIdentifiers}
              onChangeText={setCulturalIdentifiers}
            />
            <Input
              placeholder="LGBTQ+ affirming? (yes/no)"
              value={lgbtqAffirming}
              onChangeText={setLgbtqAffirming}
            />
            <Input
              placeholder="Board certified? (yes/no)"
              value={boardCertified}
              onChangeText={setBoardCertified}
            />

            {/* ADDRESS */}
            <SectionHeader text="Practice Address" />
            <Input
              placeholder="Street Address"
              value={address}
              onChangeText={setAddress}
            />
            <Input
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <Input
              placeholder="State (e.g. NY)"
              autoCapitalize="characters"
              maxLength={2}
              value={stateCode}
              onChangeText={setStateCode}
            />
            <Input
              placeholder="ZIP"
              value={zip}
              onChangeText={setZip}
              keyboardType="number-pad"
            />
          </ScrollView>

          {/* SAVE BAR */}
          <View style={styles.saveBar}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                saving && { opacity: 0.6 },
              ]}
              disabled={saving}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  Save Profile
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/* small subcomponents */

const SectionHeader = ({ text }) => (
  <Text style={styles.sectionHeader}>{text}</Text>
);

const SectionLabel = ({ text }) => (
  <Text style={styles.sectionLabel}>{text}</Text>
);

const Input = ({ style, ...props }) => (
  <TextInput
    {...props}
    style={[styles.input, style]}
    placeholderTextColor={GRAY_500}
  />
);

const MultilineInput = ({ style, ...props }) => (
  <TextInput
    {...props}
    multiline
    style={[styles.multiline, style]}
    placeholderTextColor={GRAY_500}
  />
);

/* styles */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingRight: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    marginLeft: 4,
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionLabel: {
    color: GRAY_700,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    color: GRAY_900,
    fontWeight: '800',
    fontSize: 20,
  },

  input: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GRAY_300,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: GRAY_900,
    marginBottom: 12,
  },

  multiline: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GRAY_300,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: GRAY_900,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  saveBar: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
});
