// js/components/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@email.com',
    dateOfBirth: null,
    allergies: null,
    medications: null,
    healthcareProviders: null,
    bloodType: null,
  });

  const renderProfileItem = (title, value) => (
    <View style={styles.profileItem}>
      <Text style={styles.profileItemTitle}>{title}</Text>
      <Text style={styles.profileItemValue}>{value || 'Not set'}</Text>
      <TouchableOpacity onPress={() => Alert.alert('Edit', `${title} editing coming soon!`)}>
        <Text style={styles.tapToEdit}>Tap to edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header without Back button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your health profile and preferences</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#9CA3AF" />
          </View>
          <Text style={styles.profileName}>{userProfile.name}</Text>
        </View>

        {/* Health Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View style={styles.profileItems}>
          {renderProfileItem('Date of Birth', userProfile.dateOfBirth)}
          {renderProfileItem('Allergies', userProfile.allergies || 'None reported')}
          {renderProfileItem('Medications', userProfile.medications || 'Not specified')}
          {renderProfileItem('Healthcare Providers', userProfile.healthcareProviders || 'None selected')}
          {renderProfileItem('Blood Type', userProfile.bloodType)}
        </View>

        {/* Footer space */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#10B981', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 14, opacity: 0.9 },
  userEmail: { color: '#E5E7EB', marginTop: 4, fontSize: 13 },
  content: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  profileName: { fontSize: 22, fontWeight: '700', color: '#374151' },
  section: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#F9FAFB', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginBottom: 12 },
  editButton: { backgroundColor: '#10B981', borderRadius: 8, alignItems: 'center', paddingVertical: 12 },
  editButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  profileItems: { paddingHorizontal: 20 },
  profileItem: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  profileItemTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  profileItemValue: { fontSize: 16, color: '#6B7280', marginVertical: 6 },
  tapToEdit: { color: '#10B981', fontSize: 14, fontWeight: '500' },
});
