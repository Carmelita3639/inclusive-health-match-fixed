// js/components/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, assertSupabaseReachable } from '../supabase'; // correct relative path

const GREEN = '#10B981';
const NAVY = '#1F2937';
const INPUT_BG = '#EFE7FB';
const INPUT_BORDER = '#D6CCE9';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    setBusy(true);
    try {
      // 1) Prove the device can reach Supabase (separates transport vs. auth)
      await assertSupabaseReachable();

      // 2) Sign in with email + password
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert('Login failed', error.message);
        return;
      }

      // 3) Navigate to Dashboard (and prevent going back to Login)
      if (navigation?.reset) {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else {
        Alert.alert(
          'Logged in',
          'Navigation stack not available. Make sure LoginScreen is inside a Stack Navigator.'
        );
      }
    } catch (e) {
      // Transport/DNS/TLS/VPN/ATS errors typically surface here
      const msg = typeof e?.message === 'string' ? e.message : String(e);
      Alert.alert(
        'Login failed',
        `Network/transport error while reaching Supabase.\n\n${msg}\n\nIf on iOS simulator, check VPN/Proxy/ATS and try again.`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Image
            source={require('../../assets/login-banner.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Brand */}
          <Text style={styles.inclusive}>INCLUSIVE</Text>
          <Text style={styles.healthMatch}>HEALTH MATCH</Text>
          <Text style={styles.welcome}>Welcome</Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              returnKeyType="next"
              editable={!busy}
              accessibilityLabel="Email"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={onLogin}
              editable={!busy}
              accessibilityLabel="Password"
            />
          </View>

          {/* Login */}
          <TouchableOpacity
            style={[styles.loginBtn, busy && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={onLogin}
            disabled={busy}
          >
            <Text style={styles.loginText}>{busy ? 'Loading…' : 'Login'}</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('ForgotPassword')}
            activeOpacity={0.7}
            style={styles.forgotButton}
            disabled={busy}
          >
            <Text style={styles.forgot}>FORGOT YOUR PASSWORD?</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrefix}>DON'T HAVE AN ACCOUNT? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate?.('Register')}
              activeOpacity={0.7}
              disabled={busy}
            >
              <Text style={styles.signupLink}>SIGN UP</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: { paddingHorizontal: 32, alignItems: 'center' },
  logo: { width: '75%', height: 120, marginTop: 10, marginBottom: 20 },
  inclusive: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  healthMatch: {
    fontSize: 36,
    fontWeight: '900',
    color: GREEN,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  welcome: { fontSize: 28, fontWeight: '800', color: NAVY, textAlign: 'center', marginBottom: 16 },
  inputWrap: { width: '100%', marginBottom: 16 },
  input: {
    width: '100%',
    backgroundColor: INPUT_BG,
    borderColor: INPUT_BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: GREEN,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  loginText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  forgotButton: { marginTop: 24, marginBottom: 8 },
  forgot: { color: GREEN, fontSize: 14, fontWeight: '700', textAlign: 'center', textDecorationLine: 'underline' },
  signupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  signupPrefix: { color: NAVY, fontSize: 14, fontWeight: '700' },
  signupLink: { color: GREEN, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
