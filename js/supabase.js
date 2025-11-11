// js/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Persist Supabase session in Expo
const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// ---- ENV (Expo SDK 54 public envs only) ----
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Ensure they exist in your .env and are loaded by Expo.'
  );
}

// ---- Client ----
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN has no URL bar
  },
});

// ---- Connectivity probe (helps debug "Network request failed") ----
// If this throws a TypeError/AbortError, it's a transport/DNS/TLS/VPN issue.
// Any HTTP status (200/401/404) proves the device can reach Supabase.
export async function assertSupabaseReachable(timeoutMs = 6000) {
  if (!SUPABASE_URL) throw new Error('No SUPABASE_URL configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      // Some projects require apikey on health; harmless if not required
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Health check failed: HTTP ${res.status} ${body || ''}`.trim());
    }
    return true;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export default supabase;
