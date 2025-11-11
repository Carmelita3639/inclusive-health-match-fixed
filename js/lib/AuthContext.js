// js/lib/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import supabase from '../../supabase'; // path is from js/lib/* up to js/supabase.js

const AuthContext = createContext();

const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
const AUTH_REDIRECT_URL =
  extra?.authRedirectUrl ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://localhost');

// Provider
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 1) Load current session once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.log('[Auth] getSession error:', error);
        if (!mounted) return;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.log('[Auth] getSession exception:', e);
      } finally {
        if (mounted) setIsReady(true);
      }
    })();

    // 2) Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        subscription?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  // 3) Auth actions exposed to the app
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data?.session ?? null);
    setUser(data?.user ?? null);
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  const sendMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: AUTH_REDIRECT_URL },
    });
    if (error) throw error;
    return data;
  };

  const value = useMemo(
    () => ({ user, session, isReady, signIn, signOut, sendMagicLink }),
    [user, session, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
