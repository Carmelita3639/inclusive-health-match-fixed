// js/components/ForgotPasswordScreen.js
// Real Forgot Password Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import supabase from '../supabase';

const GREEN = '#10B981';
const NAVY = '#1F2937';
const INPUT_BG = '#EFE7FB';
const INPUT_BORDER = '#D6CCE9';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const onResetPassword = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'yourapp://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert(
        'Check Your Email',
        'We sent you a password reset link. Please check your email inbox.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (e) {
      console.error('Password reset error:', e);
      Alert.alert('Error', String(e?.message || e));
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
          {/* Brand Text */}
          <Text style={styles.inclusive}>INCLUSIVE</Text>
          <Text style={styles.healthMatch}>HEALTH MATCH</Text>
          <Text style={styles.welcome}>Reset Password</Text>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
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
              returnKeyType="done"
              onSubmitEditing={onResetPassword}
              editable={!busy}
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetBtn, busy && styles.resetBtnDisabled]}
            activeOpacity={0.85}
            onPress={onResetPassword}
            disabled={busy}
          >
            <Text style={styles.resetText}>
              {busy ? 'Sending…' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            style={styles.backButton}
            disabled={busy}
          >
            <Text style={styles.backLink}>Back to Login</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { 
    flex: 1 
  },
  container: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  inclusive: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 40,
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
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputWrap: {
    width: '100%',
    marginBottom: 20,
  },
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
  resetBtn: {
    width: '100%',
    backgroundColor: GREEN,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  resetBtnDisabled: {
    opacity: 0.6,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  backButton: {
    marginTop: 24,
  },
  backLink: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});