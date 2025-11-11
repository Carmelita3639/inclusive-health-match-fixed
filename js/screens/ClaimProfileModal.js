// screens/ClaimProfileModal.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const BLUE = "#2563EB";

export default function ClaimProfileModal({ route, navigation }) {
  const incoming = route?.params?.provider || {};
  const [fullName, setFullName] = useState(incoming.full_name || "");
  const [npi, setNpi] = useState(incoming.npi || "");
  const [specialty, setSpecialty] = useState(incoming.taxonomy_description || "");
  const [gender, setGender] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");

  const onSubmit = async () => {
    // TODO: replace with Supabase insert into `claimed_profiles`
    // For now, just confirm and close
    Alert.alert("Submission received", "We’ll review your claim shortly.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FA" }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Claim / Update Provider Profile</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Jane Q. Doe" />

        <Text style={styles.label}>NPI</Text>
        <TextInput style={styles.input} value={npi} onChangeText={setNpi} keyboardType="number-pad" placeholder="10-digit NPI" />

        <Text style={styles.label}>Specialty</Text>
        <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} placeholder="Pediatrics" />

        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="F / M / Non-binary" />

        <Text style={styles.label}>Languages</Text>
        <TextInput style={styles.input} value={languages} onChangeText={setLanguages} placeholder="English, Spanish" />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Short professional bio"
          multiline
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
          <Text style={styles.primaryText}>Submit Claim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 14, color: "#6B7280", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "white", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#111827", fontWeight: "600" },
});
