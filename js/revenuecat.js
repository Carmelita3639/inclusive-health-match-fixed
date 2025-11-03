// revenuecat.js — Safe in Expo Go; native on Dev/Store builds
import { Platform, NativeModules } from 'react-native';

// ⬇️ Your public SDK keys (keep yours here)
const API_KEYS = {
  ios: 'appl_rVgRGlTUgLMXntcYZMwrLaFetWG',
  android: 'goog_WYkzIYpImrGrggGdiYWB0jmdfJ',
};

// Try to load the native module only when available
let Purchases = null;
let isNativePurchasesAvailable = false;

try {
  // This require MUST be a literal string (not from a variable)
  // In Expo Go this will throw; we catch and keep Purchases = null
  // In Dev Client / Store build it will succeed.
  // eslint-disable-next-line import/no-extraneous-dependencies
  const mod = require('react-native-purchases');
  Purchases = mod?.default ?? mod;
  isNativePurchasesAvailable = !!NativeModules?.RNPurchases;
} catch {
  Purchases = null;
  isNativePurchasesAvailable = false;
}

class RevenueCatService {
  constructor() {
    this.isSupported = isNativePurchasesAvailable;
    this.isConfigured = false;
    this._listeners = new Set();
    this._nativeDetach = null;
    this._warned = false;
  }

  /** Configure the SDK (no-op in Expo Go) */
  async configure(userId = null) {
    if (!this.isSupported || !Purchases) {
      // Expo Go path — no native purchases. Avoid crashes and keep logging minimal.
      if (!this._warned && __DEV__) {
        console.log(
          '[RevenueCat] Expo Go detected. Purchases disabled. ' +
          'Use a Dev Client/Store build to test purchases.'
        );
        this._warned = true;
      }
      return;
    }

    if (this.isConfigured && !userId) return;

    const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    if (!apiKey) {
      console.warn('[RevenueCat] Missing public SDK key.');
      return;
    }

    try {
      Purchases.setLogLevel?.(Purchases.LOG_LEVEL?.DEBUG ?? 2);
      await Purchases.configure({ apiKey });

      if (userId) {
        try { await Purchases.logIn(userId); } catch { /* ignore */ }
      }

      if (!this._nativeDetach && Purchases.addCustomerInfoUpdateListener) {
        const detach = Purchases.addCustomerInfoUpdateListener((info) => {
          for (const cb of this._listeners) {
            try { cb(info); } catch {}
          }
        });
        this._nativeDetach = typeof detach === 'function' ? detach : null;
      }

      this.isConfigured = true;
      if (__DEV__) console.log('[RevenueCat] configured');
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

  async logIn(userId) {
    if (!this.isSupported || !this.isConfigured || !Purchases) return { loggedIn: false };
    try {
      const res = await Purchases.logIn(userId);
      return { loggedIn: !!res?.customerInfo };
    } catch {
      return { loggedIn: false };
    }
  }

  async logOut() {
    if (!this.isSupported || !this.isConfigured || !Purchases) return;
    try { await Purchases.logOut(); } catch {}
  }

  async getOfferings() {
    if (!this.isSupported || !this.isConfigured || !Purchases) return null;
    try { return await Purchases.getOfferings(); }
    catch (e) { if (__DEV__) console.warn('[RevenueCat] getOfferings error:', e?.message || e); return null; }
  }

  async getCustomerInfo() {
    if (!this.isSupported || !this.isConfigured || !Purchases) return null;
    try { return await Purchases.getCustomerInfo(); }
    catch { return null; }
  }

  async checkPremiumStatus() {
    const info = await this.getCustomerInfo();
    // If your entitlement key isn’t literally "premium", detect any active entitlement:
    const active = info?.entitlements?.active || {};
    const hasAny = Object.keys(active).length > 0;
    const hasPremiumKey = !!active?.premium;
    return hasPremiumKey || hasAny;
  }

  async purchasePackage(pkg) {
    if (!this.isSupported || !this.isConfigured || !Purchases)
      return { success: false, cancelled: true, note: 'Purchases unsupported in Expo Go' };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const active = customerInfo?.entitlements?.active || {};
      return { success: Object.keys(active).length > 0, customerInfo };
    } catch (e) {
      if (e?.userCancelled) return { success: false, cancelled: true };
      return { success: false, error: e?.message || String(e) };
    }
  }

  async restorePurchases() {
    if (!this.isSupported || !this.isConfigured || !Purchases)
      return { success: false, note: 'Restore unsupported in Expo Go' };
    try {
      const info = await Purchases.restorePurchases();
      const active = info?.entitlements?.active || {};
      return { success: true, isPremium: Object.keys(active).length > 0, customerInfo: info };
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  }
}

export default new RevenueCatService();
