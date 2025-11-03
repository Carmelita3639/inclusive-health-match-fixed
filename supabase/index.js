// js/supabase/index.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function mask(str = '') {
  return str ? `${str.slice(0, 6)}…${str.slice(-6)}` : '(missing)';
}

const ENV_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const ENV_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

const extra =
  Constants?.expoConfig?.extra ||
  Constants?.manifest?.extra ||
  {};
const EXTRA_URL = extra.supabaseUrl?.trim?.();
const EXTRA_KEY = extra.supabaseAnonKey?.trim?.();

export const SUPABASE_URL = ENV_URL || EXTRA_URL;
export const SUPABASE_ANON_KEY = ENV_KEY || EXTRA_KEY;

console.log('[Supabase] URL:', SUPABASE_URL || '(missing)');
console.log('[Supabase] ANON key:', mask(SUPABASE_ANON_KEY));

let supabase = null;

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      '[Supabase] Missing credentials. ' +
        'Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
        'or expo.extra.supabaseUrl/supabaseAnonKey are defined.'
    );
  } else {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log('[Supabase] ✅ Client created successfully');
  }
} catch (error) {
  console.error('[Supabase] ❌ Failed to create client:', error);
  supabase = null;
}

export default supabase;
