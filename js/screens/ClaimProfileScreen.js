// js/screens/ClaimProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#2563EB';
const GRAY_900 = '#111827';
const GRAY_600 = '#4B5563';
const GRAY_500 = '#6B7280';
const GRAY_300 = '#D1D5DB';
const GRAY_200 = '#E5E7EB';
const BG = '#F7F8FA';

export default function ClaimProfileScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { npi, provider } = route.params || {};

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color={BLUE} />
        </View>
        
        <Text style={styles.title}>Claim Your Profile</Text>
        <Text style={styles.subtitle}>
          Verify your identity to claim and manage this provider profile
        </Text>

        {/* Provider Info Card */}
        {(npi || provider) && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Provider Information:</Text>
            
            {provider?.fullName && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color={GRAY_600} />
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Name: </Text>
                  {provider.fullName}
                </Text>
              </View>
            )}
            
            {npi && (
              <View style={styles.infoRow}>
                <Ionicons name="card" size={18} color={GRAY_600} />
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>NPI: </Text>
                  {npi}
                </Text>
              </View>
            )}
            
            {provider?.specialty && (
              <View style={styles.infoRow}>
                <Ionicons name="medkit" size={18} color={GRAY_600} />
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Specialty: </Text>
                  {provider.specialty}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Claim Process:</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verify Identity</Text>
              <Text style={styles.stepText}>
                Provide documentation to prove you are this provider
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set Up Profile</Text>
              <Text style={styles.stepText}>
                Add contact info, photo, and cultural competencies
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Verified</Text>
              <Text style={styles.stepText}>
                Receive verification badge after review
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            // TODO: Navigate to verification form
            console.log('Start claim process for NPI:', npi);
          }}
        >
          <Text style={styles.primaryButtonText}>Start Claim Process</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Need help? Contact support@inclusivehealthmatch.com
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: BLUE,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: GRAY_900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY_600,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: GRAY_200,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_900,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: GRAY_600,
    marginLeft: 8,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: GRAY_900,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GRAY_900,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GRAY_900,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: GRAY_600,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY_300,
    marginBottom: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: GRAY_600,
    fontWeight: '700',
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: GRAY_500,
    textAlign: 'center',
  },
});