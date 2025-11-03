// js/components/CulturalCalendar.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Import Supabase (optional) ---
let supabase = null;
try {
  supabase = require('../supabase').default ?? require('../supabase');
} catch { /* no-op */ }

// --- Local fallback data (always available) ---
const FALLBACK = [
  {
    id: '1',
    name: "National Women's Health Week",
    fixed_date: '2024-05-12',
    month_range: 'May 12-18',
    culture_religion: 'Global',
    description: "Focus on women's health awareness",
    health_wellness_connection: 'Promotes preventive screenings & wellness education',
    category: 'Health Awareness',
    dietary_considerations: "Nutrition for women's health",
    traditional_activities: ['Health screenings', 'Wellness workshops'],
    wellness_suggestions: ['Schedule preventive care', 'Practice self-care']
  },
  {
    id: '2',
    name: 'Mental Health Awareness Month',
    fixed_date: null,
    month_range: 'May',
    culture_religion: 'Global',
    description: 'Promoting mental health awareness',
    health_wellness_connection: 'Reduces stigma; promotes resources',
    category: 'Mental Health',
    dietary_considerations: 'Foods that support brain health',
    traditional_activities: ['Education', 'Support groups'],
    wellness_suggestions: ['Mindfulness', 'Seek support']
  },
  {
    id: '3',
    name: 'Pride Month',
    fixed_date: null,
    month_range: 'June',
    culture_religion: 'LGBTQ+',
    description: 'Celebration and inclusion',
    health_wellness_connection: 'Promotes inclusive care & awareness',
    category: 'Cultural Awareness',
    dietary_considerations: 'Inclusive nutrition education',
    traditional_activities: ['Parades', 'Health fairs'],
    wellness_suggestions: ['Find affirming care', 'Build supportive community']
  },
  {
    id: '4',
    name: "Valentine's Day",
    fixed_date: '2024-02-14',
    month_range: 'February 14',
    culture_religion: 'Western/Christian',
    description: 'Day of love and affection',
    health_wellness_connection: 'Relationships & emotional wellness',
    category: 'Cultural Holiday',
    dietary_considerations: 'Chocolate, dinners',
    traditional_activities: ['Gifts', 'Dinners'],
    wellness_suggestions: ['Express gratitude', 'Practice self-love']
  }
];

const MONTHS = ['All','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CULTURES = ['All','Global','Christian','Hindu','Western','Islamic','Jewish','Buddhist','African American','Latino/Hispanic','Asian'];

export default function CulturalCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('All');
  const [culture, setCulture] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let rows = [...FALLBACK];
      if (supabase?.from) {
        try {
          const { data, error } = await supabase
            .from('cultural_holidays')
            .select('*')
            .eq('is_active', true)
            .order('fixed_date', { ascending: true });
          if (!error && Array.isArray(data) && data.length) {
            rows = data;
          } else if (error) {
            console.warn('[Calendar] Supabase error:', error.message);
          }
        } catch (e) {
          console.warn('[Calendar] Network or client error:', e?.message);
        }
      }
      if (!cancelled) {
        setHolidays(rows);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = holidays;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.culture_religion || '').toLowerCase().includes(q) ||
        (h.description || '').toLowerCase().includes(q)
      );
    }
    if (month !== 'All') {
      const mIdx = MONTHS.indexOf(month);
      list = list.filter(h => {
        if (h.fixed_date) {
          const d = new Date(h.fixed_date);
          return d.getMonth() + 1 === mIdx;
        }
        return (h.month_range || '').toLowerCase().includes(month.toLowerCase());
      });
    }
    if (culture !== 'All') {
      const c = culture.toLowerCase();
      list = list.filter(h => (h.culture_religion || '').toLowerCase().includes(c));
    }
    return list;
  }, [holidays, search, month, culture]);

  const fmtDate = (h) => {
    if (h.fixed_date) {
      const d = new Date(h.fixed_date);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return h.month_range || 'Date varies';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading cultural holidays...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean Header (no back button) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cultural Calendar</Text>
        <Text style={styles.headerSubtitle}>
          Health observances and cultural events
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search culture, name, wellness, dietary..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {MONTHS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.filterBtn, month === m && styles.filterBtnActive]}
            onPress={() => setMonth(m)}
          >
            <Text style={[styles.filterText, month === m && styles.filterTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll,{marginTop:8}]}>
        {CULTURES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.filterBtn, culture === c && styles.filterBtnActive]}
            onPress={() => setCulture(c)}
          >
            <Text style={[styles.filterText, culture === c && styles.filterTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {filtered.length ? filtered.map(h => (
          <View key={h.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{h.name}</Text>
              <View style={[styles.tag, tagStyle(h.culture_religion)]}>
                <Text style={styles.tagText}>{h.culture_religion}</Text>
              </View>
            </View>
            <Text style={styles.date}>{fmtDate(h)}</Text>
            {h.category ? <Text style={styles.category}>{h.category}</Text> : null}
            <Text style={styles.desc}>{h.description}</Text>

            {h.health_wellness_connection ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health & Wellness Connection</Text>
                <Text style={styles.sectionBody}>{h.health_wellness_connection}</Text>
              </View>
            ) : null}

            {h.dietary_considerations ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dietary Considerations</Text>
                <Text style={styles.sectionBody}>{h.dietary_considerations}</Text>
              </View>
            ) : null}
          </View>
        )) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No holidays match your filters</Text>
            <Text style={styles.emptyBody}>Try adjusting search or filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const tagStyle = (c='') => {
  const s = c.toLowerCase();
  if (s.includes('western') || s.includes('christian')) return { backgroundColor:'#10B981' };
  if (s.includes('hindu')) return { backgroundColor:'#F59E0B' };
  if (s.includes('islamic')) return { backgroundColor:'#3B82F6' };
  if (s.includes('jewish')) return { backgroundColor:'#8B5CF6' };
  return { backgroundColor:'#6B7280' };
};

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff' },
  header:{ backgroundColor:'#10B981', paddingHorizontal:16, paddingVertical:20, paddingTop:40 },
  headerTitle:{ color:'#fff', fontSize:24, fontWeight:'bold', marginBottom:4 },
  headerSubtitle:{ color:'#fff', fontSize:14, opacity:0.9 },

  searchContainer:{ flexDirection:'row', alignItems:'center', backgroundColor:'#F9FAFB', margin:16, borderRadius:12, paddingHorizontal:12 },
  searchIcon:{ marginRight:8 },
  searchInput:{ flex:1, paddingVertical:12, fontSize:16, color:'#374151' },

  filterScroll:{ paddingHorizontal:16 },
  filterBtn:{ backgroundColor:'#F3F4F6', paddingHorizontal:16, paddingVertical:8, borderRadius:20, marginRight:8 },
  filterBtnActive:{ backgroundColor:'#10B981' },
  filterText:{ color:'#374151', fontSize:14, fontWeight:'500' },
  filterTextActive:{ color:'#fff' },

  card:{ backgroundColor:'#fff', marginHorizontal:16, marginVertical:8, padding:16, borderRadius:12, borderWidth:1, borderColor:'#E5E7EB', shadowColor:'#000', shadowOpacity:0.1, shadowRadius:2, shadowOffset:{width:0,height:1}, elevation:2 },
  cardHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  cardTitle:{ fontSize:18, fontWeight:'bold', color:'#374151', flex:1, marginRight:12 },
  tag:{ paddingHorizontal:8, paddingVertical:4, borderRadius:12 },
  tagText:{ color:'#fff', fontSize:12, fontWeight:'600' },
  date:{ fontSize:14, color:'#6B7280', marginBottom:4 },
  category:{ fontSize:14, color:'#10B981', fontWeight:'600', marginBottom:8 },
  desc:{ fontSize:14, color:'#374151', lineHeight:20, marginBottom:12 },

  section:{ marginTop:4, marginBottom:8 },
  sectionTitle:{ fontSize:16, fontWeight:'600', color:'#1F2937', marginBottom:6 },
  sectionBody:{ fontSize:14, color:'#4B5563', lineHeight:20 },

  loadingContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:{ marginTop:12, fontSize:16, color:'#6B7280' },

  empty:{ alignItems:'center', paddingVertical:60 },
  emptyTitle:{ fontSize:18, fontWeight:'600', color:'#374151', marginBottom:8 },
  emptyBody:{ fontSize:14, color:'#6B7280' },
});
