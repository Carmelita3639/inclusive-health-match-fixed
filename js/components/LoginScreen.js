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
  SafeAreaView,
} from 'react-native';

// ---- Auth hook (root-level) ----
import { useAuth } from '../AuthContext'; // <-- adjust if your path differs

// ---- Optional Supabase (only used for magic link button) ----
let supabase = null;
try {
  // try common locations
  supabase = (require('../../supabase')?.default) ?? require('../../supabase');
} catch { /* noop */ }

const GREEN = '#10B981';
const PINK_BG = '#F5E1EC';
const FIELD_BORDER = '#E5E7EB';
const NAVY = '#0B1623';
const TEXT = '#111827';
const MUTED = '#6B7280';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
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
    } catch (e) {
      Alert.alert('Error', e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      Alert.alert('Email required', 'Enter your email to receive a login link.');
      return;
    }
    if (!supabase) {
      Alert.alert('Unavailable', 'Magic link requires Supabase to be configured.');
      return;
    }
    setSending(true);
    try {
      const redirectTo =
        (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_AUTH_REDIRECT_URL) ||
        'https://example.com/login-complete';
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      Alert.alert('Sent', 'Check your email for the login link.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not send the login link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <Image
            source={require('../../assets/login-banner.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Titles */}
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={styles.h1}>INCLUSIVE</Text>
            <Text style={[styles.h1, { color: GREEN }]}>HEALTH MATCH</Text>
            <Text style={styles.tagline}>Find culturally competent Healthcare</Text>
            <Text style={styles.welcome}>WELCOME</Text>
          </View>

          {/* Inputs */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8B5C70"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8B5C70"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.primaryBtn, busy && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={busy}
          >
            <Text style={styles.primaryText}>{busy ? 'Signing in…' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, sending && { opacity: 0.7 }]}
            onPress={handleMagicLink}
            disabled={sending}
          >
            <Text style={styles.secondaryText}>
              {sending ? 'Sending…' : 'Email me a login link'}
            </Text>
          </TouchableOpacity>

          {/* Links */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkStrong}>FORGOT YOUR PASSWORD?</Text>
          </TouchableOpacity>

          <Text style={styles.smallMuted}>
            DON’T HAVE AN ACCOUNT?{' '}
            <Text style={styles.strongLink} onPress={() => navigation.navigate('SignUp')}>
              SIGN UP
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, alignItems: 'center' },

  logo: {
    width: 180,
    height: 110,
    marginTop: 10,
    marginBottom: 4,
  },

  h1: {
    fontSize: 22,
    fontWeight: '900',
    color: TEXT,
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
  },
  welcome: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    letterSpacing: 1,
  },

  input: {
    alignSelf: 'stretch',
    backgroundColor: PINK_BG,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 16,
    color: TEXT,
  },

  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  secondaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  linkStrong: {
    marginTop: 14,
    color: GREEN,
    fontWeight: '800',
    fontSize: 12,
  },
  smallMuted: {
    marginTop: 8,
    color: MUTED,
    fontSize: 11,
  },
  strongLink: { color: GREEN, fontWeight: '900' },
});
