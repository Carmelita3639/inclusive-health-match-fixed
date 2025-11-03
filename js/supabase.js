// js/supabase.js

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Persist Supabase auth session securely in React Native
const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// ✅ Active Supabase project credentials
// Exporting these so we can log them in App.js at runtime
export const SUPABASE_URL = 'https://ajowmbwaaropdijrozaa.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqb3dtYndhYXJvcGRpanJvemFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjM4MTMsImV4cCI6MjA3NzA5OTgxM30.edxAqXAbuTPHH4PGCwL6bJnUpegOiF4U9v33Xntc06Y';

// Create a single Supabase client for the app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: ExpoSecureStoreAdapter,
  },
});

// Helper: check auth/session (mostly local)
export async function debugSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ [debugSupabaseConnection] Session data:', data);
    console.log('⚠️ [debugSupabaseConnection] Session error:', error);
  } catch (err) {
    console.log('❌ [debugSupabaseConnection] FAILED:', err);
  }
}

// Helper: force a live round-trip to your DB
// This actually calls your Supabase REST endpoint and will prove DNS + RLS
export async function probeSupabaseRegistryTable() {
  try {
    const { data, error } = await supabase
      .from('nppes_registry')
      .select('npi, full_name')
      .limit(1);

    console.log('🌐 [probeSupabaseRegistryTable] rows:', data);
    console.log('🌐 [probeSupabaseRegistryTable] error:', error);
  } catch (err) {
    console.log('🔥 [probeSupabaseRegistryTable] network/other failure:', err);
  }
}
