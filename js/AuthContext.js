// js/AuthContext.js - Enhanced with network error handling
import React, { createContext, useContext, useState, useEffect } from 'react';
import RevenueCatService from './revenuecat.js';
import { supabase } from './supabase.js';  // ✅ Changed to named import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if there's an existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const email = session.user.email;
        setUser({
          email: email,
          name: email?.split('@')[0] || 'User',
          isAuthenticated: true,
        });
        
        // Configure RevenueCat for existing user
        try {
          await RevenueCatService.configure(email);
          const premiumStatus = await RevenueCatService.checkPremiumStatus();
          setIsPremium(premiumStatus);
        } catch (revenueCatError) {
          console.warn('RevenueCat initialization failed (non-blocking):', revenueCatError);
          setIsPremium(false);
        }
      } else {
        setUser(null);
        setIsPremium(false);
      }
    } catch (error) {
      console.warn('Auth initialization error (network issue):', error);
      // Don't block app - just start with no user
      setUser(null);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await RevenueCatService.logOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear user even if sign out fails
      setUser(null);
      setIsPremium(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      // Validate inputs
      if (!email || typeof email !== 'string') {
        throw new Error('Valid email is required');
      }

      // Extract name from email safely
      const userName = email.includes('@') 
        ? email.split('@')[0] 
        : email;

      // Set user with isAuthenticated immediately
      const newUser = {
        email: email,
        name: userName,
        isAuthenticated: true,
      };
      setUser(newUser);
      
      // Configure RevenueCat in background (don't block on this)
      try {
        await RevenueCatService.configure(email);
        const premiumStatus = await RevenueCatService.checkPremiumStatus();
        setIsPremium(premiumStatus);
      } catch (revenueCatError) {
        console.warn('RevenueCat error (non-blocking):', revenueCatError);
        setIsPremium(false);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePremiumStatus = async () => {
    try {
      const premiumStatus = await RevenueCatService.checkPremiumStatus();
      setIsPremium(premiumStatus);
      return premiumStatus;
    } catch (error) {
      console.error('Error updating premium status:', error);
      return false;
    }
  };

  const purchasePremium = async (packageToPurchase) => {
    try {
      const result = await RevenueCatService.purchasePackage(packageToPurchase);
      
      if (result.success) {
        setIsPremium(true);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Purchase failed' };
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: error.message };
    }
  };

  const restorePurchases = async () => {
    try {
      await RevenueCatService.restorePurchases();
      const premiumStatus = await RevenueCatService.checkPremiumStatus();
      setIsPremium(premiumStatus);
      return { success: true, isPremium: premiumStatus };
    } catch (error) {
      console.error('Restore purchases error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isPremium,
    loading,
    signOut,
    signIn,
    updatePremiumStatus,
    purchasePremium,
    restorePurchases,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};