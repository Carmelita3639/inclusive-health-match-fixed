// AuthContext.js — keeps isPremium in context with push-style RevenueCat updates
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import RevenueCatService from '../revenuecat';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Replace with your real auth when ready
  const [user, setUser] = useState({
    email: 'carmelita3639@gmail.com',
    name: 'Carmelita Rodriguez',
    isAuthenticated: true,
  });

  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  /** Configure RevenueCat + initial entitlement, and attach push listener */
  useEffect(() => {
    let isMounted = true;
    let detach = () => {};

    (async () => {
      try {
        await RevenueCatService.configure(user?.email);

        // Initial status
        const premium = await RevenueCatService.checkPremiumStatus();
        if (isMounted) setIsPremium(!!premium);

        // Push-style updates from RevenueCat (native listener)
        detach = RevenueCatService.addCustomerInfoListener(async () => {
          const latest = await RevenueCatService.checkPremiumStatus();
          if (isMounted) setIsPremium(!!latest);
        });
      } catch (e) {
        console.warn('[Auth] RC init error:', e?.message || e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      try { detach && detach(); } catch {}
    };
  }, [user?.email]);

  /** Manual refresh (optional for UI actions) */
  const updatePremiumStatus = async () => {
    const premium = await RevenueCatService.checkPremiumStatus();
    setIsPremium(!!premium);
    return !!premium;
    // (push updates still fire automatically via listener)
  };

  /** Purchase then rely on push update; also hard-refresh as a fallback */
  const purchasePremium = async (pkg) => {
    try {
      await RevenueCatService.configure(user?.email);
      const result = await RevenueCatService.purchasePackage(pkg);

      if (result?.cancelled) return { success: false, cancelled: true };
      if (result?.success) {
        // push listener should flip isPremium quickly; we also hard refresh:
        await updatePremiumStatus();
        return { success: true };
      }
      return { success: false, error: result?.error || 'Purchase failed' };
    } catch (e) {
      return { success: false, error: e?.message || 'Unable to complete purchase.' };
    }
  };

  /** Restore then rely on push update; also hard-refresh as a fallback */
  const restorePurchases = async () => {
    try {
      await RevenueCatService.configure(user?.email);
      const result = await RevenueCatService.restorePurchases();
      if (result?.success) {
        const premium = await updatePremiumStatus();
        return { success: true, isPremium: premium };
      }
      return { success: false, error: result?.error || 'No purchases found' };
    } catch (e) {
      return { success: false, error: e?.message || 'Unable to restore purchases.' };
    }
  };

  /** Basic sign-in/out stubs (keep your existing behavior if different) */
  const signIn = async (email, _password) => {
    const newUser = { email, name: email.split('@')[0], isAuthenticated: true };
    setUser(newUser);
    await RevenueCatService.configure(email);
    await updatePremiumStatus();
  };

  const signOut = async () => {
    try { await RevenueCatService.logOut(); } catch {}
    setUser(null);
    setIsPremium(false);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      isPremium,
      loading,
      signIn,
      signOut,
      purchasePremium,
      restorePurchases,
      updatePremiumStatus,
    }),
    [user, isPremium, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
