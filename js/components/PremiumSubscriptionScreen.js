// js/components/PremiumSubscriptionScreen.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RevenueCatService from '../../revenuecat';
import { useAuth } from '../lib/AuthContext';

const PremiumSubscriptionScreen = ({ navigation }) => {
  // If your AuthContext exposes isPremium, we’ll display it.
  // If not, we derive it locally via RevenueCat.
  const auth = useAuth?.() || {};
  const { isPremium: isPremiumFromContext } = auth;

  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isPremiumLocal, setIsPremiumLocal] = useState(false);
  const isPremium = useMemo(
    () => (typeof isPremiumFromContext === 'boolean' ? isPremiumFromContext : isPremiumLocal),
    [isPremiumFromContext, isPremiumLocal]
  );

  // Configure once and load offerings/premium status.
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await RevenueCatService.configure(); // no-op in Expo Go, real in Dev/Store build
        const [offs, premium] = await Promise.all([
          RevenueCatService.getOfferings(),
          RevenueCatService.checkPremiumStatus(),
        ]);
        if (!mounted) return;
        setOfferings(offs);
        setIsPremiumLocal(!!premium);
      } catch (e) {
        console.warn('[Premium] init error:', e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePurchase = useCallback(
    async (pkg) => {
      setPurchasing(true);
      try {
        await RevenueCatService.configure(); // safe to call repeatedly
        const result = await RevenueCatService.purchasePackage(pkg);

        if (result?.cancelled) return; // user canceled

        if (result?.success) {
          setIsPremiumLocal(true);
          Alert.alert(
            'Welcome to Premium!',
            'Your subscription is now active.',
            [{ text: 'Continue', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Purchase Failed', result?.error || 'Something went wrong. Please try again.');
        }
      } catch (e) {
        Alert.alert('Purchase Error', e?.message || 'Unable to complete purchase.');
      } finally {
        setPurchasing(false);
      }
    },
    [navigation]
  );

  const handleRestore = useCallback(async () => {
    try {
      await RevenueCatService.configure();
      const result = await RevenueCatService.restorePurchases();

      if (result?.success && result?.isPremium) {
        setIsPremiumLocal(true);
        Alert.alert('Restored', 'Your premium subscription has been restored.');
      } else if (result?.success) {
        Alert.alert('No Purchases', 'No previous purchases were found for this account.');
      } else {
        Alert.alert('Restore Failed', result?.error || 'Please try again.');
      }
    } catch (e) {
      Alert.alert('Restore Error', e?.message || 'Unable to restore purchases.');
    }
  }, []);

  const FeatureItem = ({ text }) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const renderPricingCard = (rcPackage, isRecommended = false) => {
    if (!rcPackage) return null;

    const { product } = rcPackage;
    const title = product?.title ?? 'Premium';
    const price = product?.priceString ?? '';
    const period = product?.subscriptionPeriod || 'month';

    return (
      <TouchableOpacity
        key={rcPackage.identifier}
        style={[styles.pricingCard, isRecommended && styles.recommendedCard]}
        onPress={() => handlePurchase(rcPackage)}
        disabled={purchasing}
        activeOpacity={0.85}
      >
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}

        <Text style={styles.planTitle}>{title}</Text>
        {!!price && <Text style={styles.planPrice}>{price}</Text>}
        <Text style={styles.planPeriod}>per {period}</Text>

        <View style={styles.featuresContainer}>
          <FeatureItem text="Unlimited provider matches" />
          <FeatureItem text="Advanced filtering options" />
          <FeatureItem text="Priority customer support" />
          <FeatureItem text="Cultural calendar integration" />
          <FeatureItem text="Save favorite providers" />
          <FeatureItem text="Appointment reminders" />
        </View>

        <View style={styles.purchaseButton}>
          <Text style={styles.purchaseButtonText}>
            {purchasing ? 'Processing…' : 'Subscribe Now'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // If already premium, show status screen.
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Status</Text>
        </View>

        <View style={styles.premiumStatusContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumSubtitle}>
            Enjoy unlimited access to all Inclusive Health Match features.
          </Text>

          <TouchableOpacity style={styles.manageButton} onPress={() => navigation.goBack()}>
            <Text style={styles.manageButtonText}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Ionicons name="star" size={60} color="#F59E0B" />
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to culturally competent providers and advanced matching features.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading subscription options…</Text>
          </View>
        ) : !offerings?.current ? (
          // Expo Go (or no products set up): show helpful message
          <View style={[styles.loadingContainer, { paddingHorizontal: 24 }]}>
            <Text style={styles.loadingText} textAlign="center">
              Subscriptions aren’t available in Expo Go. Build a Dev Client or Store build to test
              purchases. You can still continue using the app.
            </Text>
          </View>
        ) : (
          <View style={styles.pricingContainer}>
            {offerings.current.monthly && renderPricingCard(offerings.current.monthly)}
            {offerings.current.annual && renderPricingCard(offerings.current.annual, true)}
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Subscription auto-renews. Cancel anytime in your device settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ------------------------------ Styles ------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40, // space for dynamic island/notch
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#10B981',
    transform: [{ scale: 1.02 }],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  purchaseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restoreText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  premiumStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 16,
  },
  premiumSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  manageButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PremiumSubscriptionScreen;
