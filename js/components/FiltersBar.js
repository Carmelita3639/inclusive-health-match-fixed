// js/components/FiltersBar.js
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export default function FiltersBar({
  city = "",
  state = "",
  language = "",
  specialty = "",
  gender = "",
  onChange = () => {},
}) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={(v) => onChange({ city: v })}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="State (e.g., NY)"
        value={state}
        onChangeText={(v) => onChange({ state: v })}
        autoCapitalize="characters"
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Language (e.g., Spanish)"
        value={language}
        onChangeText={(v) => onChange({ language: v })}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Specialty (e.g., pediatric surgery)"
        value={specialty}
        onChangeText={(v) => onChange({ specialty: v })}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Gender (male / female)"
        value={gender}
        onChangeText={(v) => onChange({ gender: v })}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 12,
  },
  input: {
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
});
