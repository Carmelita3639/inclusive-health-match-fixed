// revenuecat.js — Native-first RevenueCat wrapper with Expo Go safety + push-style updates
import { Platform, NativeModules } from 'react-native';
import Purchases from 'react-native-purchases';

// ⬇️ Replace with your real public SDK keys from the RevenueCat dashboard
const API_KEYS = {
  ios: 'appl_rVgRGlTUgLMXntcYZMwrLaFetWG',
  android: 'goog_WYkzIYpImrGrggGdiYWB0jmdfJ',
};

// Detect if native RevenueCat module is available (Dev Client / Store build) or not (Expo Go)
const isNativePurchasesAvailable = !!NativeModules?.RNPurchases;

class RevenueCatService {
  constructor() {
    this.isSupported = isNativePurchasesAvailable;
    this.isConfigured = false;
    this._listeners = new Set();         // your app subscribers (AuthProvider, etc.)
    this._nativeDetach = null;           // native RC listener unsubscribe
  }

  /** Configure the SDK (no-op in Expo Go) */
  async configure(userId = null) {
    if (!this.isSupported) {
      // Expo Go path — no native purchases. Keep silent but informative.
      if (!this._warned) {
        console.warn(
          '[RevenueCat] Expo Go detected. Use a Dev Client or Store build to test purchases.\n' +
          'Build with: `eas build --profile development` and run with `npx expo start --dev-client`.'
        );
        this._warned = true;
      }
      return;
    }
    if (this.isConfigured && !userId) return;

    const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    if (!apiKey || apiKey.includes('XXXXXXXX')) {
      console.warn('[RevenueCat] Missing/placeholder API key — set your public SDK keys in revenuecat.js');
      return;
    }

    try {
      Purchases.setLogLevel?.(Purchases.LOG_LEVEL?.DEBUG ?? 2);
      await Purchases.configure({ apiKey });

      if (userId) {
        try { await Purchases.logIn(userId); } catch { /* ignore if already logged in */ }
      }

      // Attach native push-style listener once
      if (!this._nativeDetach) {
        const detach = Purchases.addCustomerInfoUpdateListener?.((info) => {
          // Notify all app-level subscribers
          for (const cb of this._listeners) {
            try { cb(info); } catch {}
          }
        });
        this._nativeDetach = typeof detach === 'function' ? detach : null;
      }

      this.isConfigured = true;
      console.log('[RevenueCat] configured');
    } catch (e) {
      console.error('[RevenueCat] configure error:', e?.message || e);
    }
  }

  /** Subscribe to push-style updates; returns an unsubscribe fn */
  addCustomerInfoListener(handler) {
    if (typeof handler !== 'function') return () => {};
    this._listeners.add(handler);
    return () => this._listeners.delete(handler);
  }

  /** Explicit login/logout passthroughs (optional) */
  async logIn(userId) {
    if (!this.isSupported || !this.isConfigured) return { loggedIn: false };
    try {
      const res = await Purchases.logIn(userId);
      return { loggedIn: !!res?.customerInfo };
    } catch {
      return { loggedIn: false };
    }
  }

  async logOut() {
    if (!this.isSupported || !this.isConfigured) return;
    try { await Purchases.logOut(); } catch {}
  }

  /** Safe getters — return null/false when unsupported or not configured */
  async getOfferings() {
    if (!this.isSupported || !this.isConfigured) return null;
    try { return await Purchases.getOfferings(); }
    catch (e) { console.warn('[RevenueCat] getOfferings error:', e?.message || e); return null; }
  }

  async getCustomerInfo() {
    if (!this.isSupported || !this.isConfigured) return null;
    try { return await Purchases.getCustomerInfo(); }
    catch { return null; }
  }

  async checkPremiumStatus() {
    const info = await this.getCustomerInfo();
    return !!info?.entitlements?.active?.premium;
  }

  async purchasePackage(pkg) {
    if (!this.isSupported || !this.isConfigured)
      return { success: false, cancelled: true, note: 'Purchases unsupported in Expo Go' };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const hasPremium = !!customerInfo?.entitlements?.active?.premium;
      return { success: hasPremium, customerInfo };
    } catch (e) {
      if (e?.userCancelled) return { success: false, cancelled: true };
      return { success: false, error: e?.message || String(e) };
    }
  }

  async restorePurchases() {
    if (!this.isSupported || !this.isConfigured)
      return { success: false, note: 'Restore unsupported in Expo Go' };
    try {
      const info = await Purchases.restorePurchases();
      return { success: true, isPremium: !!info?.entitlements?.active?.premium, customerInfo: info };
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  }
}

export default new RevenueCatService();
