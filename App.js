// App.js
// Root navigation for the Inclusive Health Match app.
// - Auth flow screens (Login, SignUp, ForgotPassword)
// - Main tab bar (Home / Provider / AI Match / Profile / Calendar)
// - Provider tab is its own nested stack so you can push ProviderCard, etc.

import React, { useEffect } from 'react';
import { Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ---------- App Screens (js/components) ----------
import LoginScreen from './js/components/LoginScreen';
import SignUpScreen from './js/components/SignUpScreen';
import ForgotPasswordScreen from './js/components/ForgotPasswordScreen';

import DashboardScreen from './js/components/DashboardScreen';
import ProviderSearchScreen from './js/components/ProviderSearchScreen';
import AiMatchChat from './js/components/AiMatchChat';
import CulturalCalendar from './js/components/CulturalCalendar';
import ProfileScreen from './js/components/ProfileScreen';

// ---------- Provider detail / claim flow (screens/) ----------
import ProviderCard from './screens/ProviderCard';
import UpdateProfileScreen from './screens/UpdateProfileScreen';
import ClaimProfileScreen from './screens/ClaimProfileScreen';

// ---------- Context ----------
import { AuthProvider } from './js/AuthContext';

// ---------- Supabase debug helpers ----------
import {
  supabase,
  SUPABASE_URL,
  debugSupabaseConnection,
  probeSupabaseRegistryTable,
} from './js/supabase';

// ---------------------------------------------
// Navigation objects
// ---------------------------------------------
const RootStack = createNativeStackNavigator();
const ProviderStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// simple emoji icon for tab bar
const EmojiIcon = ({ emoji }) => (
  <Text style={{ fontSize: 22, lineHeight: 24 }}>{emoji}</Text>
);

// -------------------------------------------------
// Provider tab stack
// - ProviderSearchScreen (search list)
// - ProviderCard (details read view)
// - ClaimProfileScreen / UpdateProfileScreen (edit/claim)
// -------------------------------------------------
function ProviderTabStack() {
  return (
    <ProviderStackNav.Navigator
      initialRouteName="ProviderSearch"
      screenOptions={{ headerShown: false }}
    >
      <ProviderStackNav.Screen
        name="ProviderSearch"
        component={ProviderSearchScreen}
      />
      <ProviderStackNav.Screen
        name="ProviderCard"
        component={ProviderCard}
      />
      <ProviderStackNav.Screen
        name="ClaimProfile"
        component={ClaimProfileScreen}
      />
      <ProviderStackNav.Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
      />
    </ProviderStackNav.Navigator>
  );
}

// -------------------------------------------------
// Bottom tab bar that shows on all "main app" screens
// -------------------------------------------------
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      {/* HOME / DASHBOARD */}
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: () => <EmojiIcon emoji="🏠" />,
        }}
      />

      {/* PROVIDER SEARCH (stack) */}
      <Tab.Screen
        name="Provider"
        component={ProviderTabStack}
        options={{
          title: 'Provider',
          tabBarIcon: () => <EmojiIcon emoji="🔍" />,
        }}
      />

      {/* AI MATCH CHAT */}
      <Tab.Screen
        name="AiMatch"
        component={AiMatchChat}
        options={{
          title: 'AI Match',
          tabBarIcon: () => <EmojiIcon emoji="💬" />,
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: () => <EmojiIcon emoji="🧑🏻‍⚕️" />,
        }}
      />

      {/* CULTURAL CALENDAR */}
      <Tab.Screen
        name="Calendar"
        component={CulturalCalendar}
        options={{
          title: 'Calendar',
          tabBarIcon: () => <EmojiIcon emoji="🗓️" />,
        }}
      />
    </Tab.Navigator>
  );
}

// -------------------------------------------------
// Root stack
// 1. Auth flow (Login / SignUp / ForgotPassword)
// 2. MainTabs once inside the app
// -------------------------------------------------
function AppNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* --- Auth / onboarding screens --- */}
      <RootStack.Screen
        name="Login"
        component={LoginScreen}
      />
      <RootStack.Screen
        name="SignUp"
        component={SignUpScreen}
      />
      <RootStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      {/* --- Main application (tabs visible) --- */}
      <RootStack.Screen
        name="MainApp"
        component={MainTabs}
      />
    </RootStack.Navigator>
  );
}

// -------------------------------------------------
// The actual exported root component
// -------------------------------------------------
export default function App() {
  // sanity-check supabase connectivity on mount
  useEffect(() => {
    async function checkSupabase() {
      try {
        console.log(
          '[Supabase] -- runtime URL constant:',
          SUPABASE_URL
        );

        // Check auth/session + reachability
        await debugSupabaseConnection();

        // Ping nppes_registry to confirm direct DB access
        await probeSupabaseRegistryTable();
      } catch (err) {
        console.log('[Supabase] FATAL:', err);
      }
    }

    checkSupabase();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
