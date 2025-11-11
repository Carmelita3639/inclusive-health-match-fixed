// js/components/AiMatchChat.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';

// ✅ ProviderCard lives in /screens
import ProviderCard from '../screens/ProviderCard';

// ✅ Engine lives in /lib
import { aiMatchSearch } from '../lib/aiMatchEngine';

import FiltersBar from './FiltersBar';

const GREEN = '#10B981';
const BLUE = '#2563EB';
const DARK = '#0f172a';

export default function AiMatchChat({ navigation }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [bubble, setBubble] = useState('');
  const [filters, setFilters] = useState({
    city: '', state: '', language: '', specialty: '', gender: '',
  });

  const updateFilters = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const onSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setLoading(true);
    setBubble(prompt);
    try {
      const merged = await aiMatchSearch({
        prompt,
        city: filters.city.trim(),
        state: filters.state.trim(),
        language: filters.language.trim(),
        specialty: filters.specialty.trim(),
        gender: filters.gender.trim(),
        limit: 25,
      });
      setResults(merged);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const onClear = () => {
    setInput('');
    setBubble('');
    setResults([]);
    setLoading(false);
    setFilters({ city: '', state: '', language: '', specialty: '', gender: '' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>AI Health Match Assistant</Text>
      <Text style={styles.sub}>Verified profiles appear first.</Text>
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>
          Tell me the competencies you need — race/culture, gender, language(s), and specialty.
        </Text>
      </View>
      <FiltersBar
        city={filters.city}
        state={filters.state}
        language={filters.language}
        specialty={filters.specialty}
        gender={filters.gender}
        onChange={updateFilters}
      />
      {bubble ? (
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{bubble}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7F8FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={results}
        keyExtractor={(item, idx) => `${item.npi || idx}`}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ProviderCard
            // your ProviderCard screen accepts route params when navigated,
            // but here we use the card component version
            provider={item}
            onView={(p) => navigation?.navigate?.('ProviderCard', { npi: p.npi, provider: p })}
            onUpdate={(p) => {
              if (p.source === 'claimed') {
                navigation?.navigate?.('UpdateProfile', { provider: p });
              } else {
                navigation?.navigate?.('ClaimProfile', { npi: p.npi, provider: p });
              }
            }}
          />
        )}
        ListEmptyComponent={
          !loading && bubble
            ? <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>No results.</Text>
            : null
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g., Black female pediatric surgeon"
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <TouchableOpacity style={[styles.cta, styles.clear]} onPress={onClear}>
          <Text style={styles.ctaText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cta, styles.send]} onPress={onSend} disabled={loading}>
          <Text style={styles.ctaText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: DARK },
  sub: { color: '#64748b', marginTop: 2 },
  promptBox: { backgroundColor: '#e6fffa', borderRadius: 12, padding: 12, marginTop: 12, borderLeftWidth: 4, borderLeftColor: GREEN },
  promptText: { color: '#0f172a' },
  userBubble: { backgroundColor: '#d1fae5', alignSelf: 'flex-start', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 14, marginTop: 14 },
  userBubbleText: { color: '#065f46', fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 12, borderRadius: 12, height: 48 },
  cta: { height: 48, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  clear: { backgroundColor: '#e5f7ef', borderWidth: 1, borderColor: '#bbf7d0' },
  send: { backgroundColor: BLUE },
  ctaText: { color: '#111827', fontWeight: '700' },
});
