// supabase.js
import { createClient } from '@supabase/supabase-js';

// Your actual Supabase project credentials
const supabaseUrl = 'https://ensispvuanpmqaelgyfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuc2lzcHZ1YW5wbXFhZWxneWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzY2NDksImV4cCI6MjA2NDMxMjY0OX0.V4TQtBJL1bmXzRt4s8nZO8_dmC2awqOJej1-MzFT4PE';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensures auth state persists across app sessions
    storage: null, // Use default storage for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export default supabase;