import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../AuthContext';


const MainApp = ({ navigation }) => {
  const { user, logout } = useAuth();

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
            try {
              await logout();
              navigation.navigate('LoginScreen');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleComingSoon = (feature) => {
    Alert.alert('Coming Soon', `${feature} will be available in the next update!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Inclusive <Text style={styles.greenText}>Health Match</Text>
          </Text>
          <Text style={styles.subtitle}>Hello, {user?.name || user?.email?.split('@')[0] || 'User'}!</Text>
        </View>

        {/* Content Cards */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Find Physicians</Text>
            <Text style={styles.cardSubtitle}>
              Connect with culturally competent healthcare providers
            </Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => navigation.navigate('ProviderSearchScreen')}
            >
              <Text style={styles.cardButtonText}>Search Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Match Chat</Text>
            <Text style={styles.cardSubtitle}>
              Get personalized physician recommendations using AI
            </Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => navigation.navigate('AiMatchChat')}
            >
              <Text style={styles.cardButtonText}>Start AI Match</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Book Appointment</Text>
            <Text style={styles.cardSubtitle}>
              Schedule appointments with providers
            </Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => handleComingSoon('Appointment Booking')}
            >
              <Text style={styles.cardButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cultural Calendar</Text>
            <Text style={styles.cardSubtitle}>
              Health observances and cultural events
            </Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => handleComingSoon('Cultural Calendar')}
            >
              <Text style={styles.cardButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#10B981',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  greenText: {
    color: '#065F46',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainApp;