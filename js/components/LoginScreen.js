// js/components/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';

const GREEN = '#10B981';
const TEXT = '#0B1221';
const MUTED = '#6B7280';
const INPUT_BG = '#E9D5FF';
const INPUT_BORDER = '#E2E8F0';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await signIn(email.trim(), password);
      if (res?.success) {
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Sign in failed', res?.error || 'Invalid credentials.');
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Only */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/app-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Titles */}
          <View style={styles.titles}>
            <Text style={styles.h1}>INCLUSIVE</Text>
            <Text style={[styles.h1, { color: GREEN }]}>HEALTH MATCH</Text>
            <Text style={styles.tagline}>Find culturally competent Healthcare</Text>
            <Text style={styles.welcome}>Welcome</Text>
          </View>

          {/* Input Fields */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8B5C70"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8B5C70"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={onSignIn}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, busy && { opacity: 0.7 }]}
            onPress={onSignIn}
            disabled={busy}
          >
            <Text style={styles.primaryText}>{busy ? 'Signing in…' : 'Login'}</Text>
          </TouchableOpacity>

          {/* Links */}
          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'Forgot password feature coming soon!')}
          >
            <Text style={styles.linkStrong}>FORGOT YOUR PASSWORD?</Text>
          </TouchableOpacity>

          <Text style={styles.smallMuted}>
            DON'T HAVE AN ACCOUNT?{' '}
            <Text
              style={styles.strongLink}
              onPress={() => Alert.alert('Coming Soon', 'Sign up feature coming soon!')}
            >
              SIGN UP
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { padding: 20, alignItems: 'center' },

  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 130,
  },

  titles: { alignItems: 'center', marginTop: 12 },
  h1: {
    fontSize: 32,
    fontWeight: '900',
    color: TEXT,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  tagline: {
    marginTop: 8,
    color: MUTED,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  welcome: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '900',
    color: TEXT,
  },

  input: {
    alignSelf: 'stretch',
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    fontSize: 16,
    color: TEXT,
  },

  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },

  linkStrong: {
    marginTop: 16,
    color: GREEN,
    fontWeight: '900',
    fontSize: 14,
  },
  smallMuted: {
    marginTop: 10,
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
  },
  strongLink: { color: GREEN, fontWeight: '900' },
});
