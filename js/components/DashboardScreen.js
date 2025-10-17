// js/components/DashboardScreen.js - Updated with RevenueCat
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useAuth } from '../AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, signOut, isPremium } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            if (signOut) {
              await signOut();
            }
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleNavigation = (screenName, fallbackMessage) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      Alert.alert('Coming Soon', fallbackMessage || `${screenName} will be available in a future update!`);
    }
  };

  const handlePremiumAction = () => {
    if (isPremium) {
      // User already has premium - maybe show premium features or account management
      Alert.alert(
        'Premium Active', 
        'You have full access to all premium features! Enjoy unlimited provider matches and advanced filtering.',
        [{ text: 'Continue', style: 'default' }]
      );
    } else {
      // Navigate to premium subscription screen
      navigation.navigate('PremiumSubscription');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top card with premium indicator */}
        <View style={[styles.topCard, isPremium && styles.premiumTopCard]}>
          <Text style={styles.topTitle}>Inclusive Health Match</Text>
          <Text style={styles.topEmail}>{user?.email ?? 'carmelita3639@gmail.com'}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Find Physicians */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Find Physicians</Text>
          <Text style={styles.cardDesc}>
            Connect with culturally competent healthcare providers
          </Text>
          <TouchableOpacity
            style={styles.ctaGreen}
            onPress={() => handleNavigation('ProviderSearchScreen', 'Provider search will be available soon!')}
          >
            <Text style={styles.ctaText}>Search Now</Text>
          </TouchableOpacity>
        </View>

        {/* AI Health Match */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Health Match</Text>
          <Text style={styles.cardDesc}>
            Get personalized physician recommendations using AI
          </Text>
          <TouchableOpacity
            style={styles.ctaGreen}
            onPress={() => handleNavigation('AiMatchChat', 'AI Health Match will be available soon!')}
          >
            <Text style={styles.ctaText}>Start AI Match</Text>
          </TouchableOpacity>
        </View>

        {/* Cultural Calendar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cultural Calendar</Text>
          <Text style={styles.cardDesc}>
            Explore holidays and observances that reflect your identity
          </Text>
          <TouchableOpacity
            style={styles.ctaGreen}
            onPress={() => handleNavigation('CulturalCalendar', 'Cultural Calendar will be available soon!')}
          >
            <Text style={styles.ctaText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* My Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Profile</Text>
          <Text style={styles.cardDesc}>
            Manage your health profile and preferences
          </Text>
          <TouchableOpacity
            style={styles.ctaGreen}
            onPress={() => handleNavigation('ProfileScreen', 'Profile management will be available soon!')}
          >
            <Text style={styles.ctaText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Features Card */}
        <View style={[styles.card, isPremium ? styles.premiumActiveCard : styles.premiumWrap]}>
          <Text style={styles.cardTitle}>
            {isPremium ? 'Premium Features Active' : 'Premium Features'}
          </Text>
          <Text style={styles.cardDesc}>
            {isPremium 
              ? 'You have unlimited access to all advanced features and priority support.'
              : 'Upgrade to unlock unlimited matches and advanced features'
            }
          </Text>
          <TouchableOpacity 
            style={isPremium ? styles.ctaGreen : styles.ctaBlue} 
            onPress={handlePremiumAction}
          >
            <Text style={styles.ctaText}>
              {isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Functional Emoji Navigation Bar */}
      <View style={styles.tabBar}>
        <TabItem label="Home" emoji="🏠" active onPress={() => {}} />
        <TabItem 
          label="Provider" 
          emoji="🩺" 
          onPress={() => handleNavigation('ProviderSearchScreen', 'Provider search coming soon!')} 
        />
        <TabItem 
          label="AI Match" 
          emoji="🤖" 
          onPress={() => handleNavigation('AiMatchChat', 'AI Match coming soon!')} 
        />
        <TabItem 
          label="Profile" 
          emoji="👤" 
          onPress={() => handleNavigation('ProfileScreen', 'Profile coming soon!')} 
        />
        <TabItem 
          label="Calendar" 
          emoji="📅" 
          onPress={() => handleNavigation('CulturalCalendar', 'Calendar coming soon!')} 
        />
      </View>
    </SafeAreaView>
  );
}

function TabItem({ label, emoji, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Text style={[styles.tabEmoji, active && styles.tabActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const GREEN = '#10B981';
const BLUE = '#2563EB';
const CARD = '#ffffff';
const PREMIUM_GOLD = '#F59E0B';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  scroll: { paddingBottom: 24 },
  topCard: {
    backgroundColor: GREEN, margin: 16, marginTop: 12, borderRadius: 12, padding: 16,
    position: 'relative',
  },
  premiumTopCard: {
    backgroundColor: PREMIUM_GOLD,
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  topEmail: { color: '#E7FFF7', fontSize: 12, textAlign: 'center', marginTop: 6 },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: CARD, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  premiumWrap: { 
    borderWidth: 1, 
    borderColor: '#2563EB55', 
    backgroundColor: '#EFF6FF' 
  },
  premiumActiveCard: {
    borderWidth: 2,
    borderColor: PREMIUM_GOLD,
    backgroundColor: '#FFFBEB',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  ctaGreen: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  ctaBlue: { backgroundColor: BLUE, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' },
  logout: { margin: 16, marginTop: 20, backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingVertical: 8, paddingHorizontal: 6, flexDirection: 'row', justifyContent: 'space-around',
    paddingBottom: 20,
  },
  tabItem: { alignItems: 'center', flex: 1 },
  tabEmoji: { fontSize: 18, color: '#6B7280' },
  tabLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  tabActive: { color: GREEN },
});