// js/components/DashboardScreen.js
// Real Dashboard - Matches your exact design

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import supabase from '../supabase';

const GREEN = '#10B981';
const BLUE = '#3B82F6';
const DARK_TEXT = '#1F2937';
const GRAY_TEXT = '#6B7280';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get current user email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inclusive Health Match</Text>
          <Text style={styles.headerEmail}>{userEmail || 'Loading...'}</Text>
        </View>

        {/* Find Physicians Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Find Physicians</Text>
          <Text style={styles.cardDescription}>
            Connect with culturally competent healthcare providers
          </Text>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate('ProviderSearch')}
          >
            <Text style={styles.buttonText}>Search Now</Text>
          </TouchableOpacity>
        </View>

        {/* AI Match Chat Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Match Chat</Text>
          <Text style={styles.cardDescription}>
            Get personalized physician recommendations using AI
          </Text>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate('AiMatchChat')}
          >
            <Text style={styles.buttonText}>Start AI Match</Text>
          </TouchableOpacity>
        </View>

        {/* Cultural Calendar Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cultural Calendar</Text>
          <Text style={styles.cardDescription}>
            Explore holidays and observances that reflect your identity
          </Text>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate('CulturalCalendar')}
          >
            <Text style={styles.buttonText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Features Card - BLUE */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>Premium Features</Text>
          <Text style={styles.cardDescription}>
            Upgrade to unlock unlimited matches and advanced features
          </Text>
          <TouchableOpacity
            style={styles.blueButton}
            onPress={() => navigation.navigate('PremiumSubscription')}
          >
            <Text style={styles.buttonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProviderSearch')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AiMatchChat')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>AI Match</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CulturalCalendar')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: GREEN,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  premiumCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BLUE,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: GRAY_TEXT,
    marginBottom: 16,
    lineHeight: 22,
  },
  greenButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
    fontWeight: '600',
  },
  navLabelActive: {
    color: BLUE,
  },
});