// js/components/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth?.() ?? {};
  
  const [profile, setProfile] = useState({
    dateOfBirth: 'Not set',
    allergies: 'None reported',
    medications: 'Not specified',
    healthcareProviders: 'None selected',
    bloodType: 'Not set',
    emergencyContact: 'Not set',
    insuranceProvider: 'Not set',
    preferredLanguage: 'English',
    culturalBackground: 'Not specified',
  });

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available in a future update!');
  };

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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }
        }
      ]
    );
  };

  const ProfileItem = ({ icon, title, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#10B981" style={styles.profileIcon} />
        <View>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your health profile and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.userName}>
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'carmelita3639@gmail.com'}</Text>
        </View>

        {/* Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <Text style={styles.sectionSubtitle}>Update your health profile and medical history</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Items */}
        <View style={styles.profileSection}>
          <ProfileItem
            icon="calendar-outline"
            title="Date of Birth"
            value={profile.dateOfBirth}
            onPress={() => Alert.alert('Coming Soon', 'Date editing will be available soon!')}
          />
          
          <ProfileItem
            icon="medical-outline"
            title="Allergies"
            value={profile.allergies}
            onPress={() => Alert.alert('Coming Soon', 'Allergy management will be available soon!')}
          />
          
          <ProfileItem
            icon="fitness-outline"
            title="Medications"
            value={profile.medications}
            onPress={() => Alert.alert('Coming Soon', 'Medication tracking will be available soon!')}
          />
          
          <ProfileItem
            icon="people-outline"
            title="Healthcare Providers"
            value={profile.healthcareProviders}
            onPress={() => Alert.alert('Coming Soon', 'Provider management will be available soon!')}
          />
          
          <ProfileItem
            icon="water-outline"
            title="Blood Type"
            value={profile.bloodType}
            onPress={() => Alert.alert('Coming Soon', 'Blood type editing will be available soon!')}
          />

          <ProfileItem
            icon="language-outline"
            title="Preferred Language"
            value={profile.preferredLanguage}
            onPress={() => Alert.alert('Coming Soon', 'Language preferences will be available soon!')}
          />

          <ProfileItem
            icon="globe-outline"
            title="Cultural Background"
            value={profile.culturalBackground}
            onPress={() => Alert.alert('Coming Soon', 'Cultural preferences will be available soon!')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProviderSearchScreen')}
        >
          <Text style={styles.navEmoji}>🔍</Text>
          <Text style={styles.navText}>Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AiMatchChat')}
        >
          <Text style={styles.navEmoji}>💬</Text>
          <Text style={styles.navText}>AI Match</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CulturalCalendar')}
        >
          <Text style={styles.navEmoji}>🗓️</Text>
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSection: {
    marginHorizontal: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    marginRight: 16,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: '#10B981',
    marginTop: -1,
  },
  navEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default ProfileScreen;