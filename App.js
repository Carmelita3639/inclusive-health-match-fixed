// App.js — with authentication flow + Stack Navigator for detail screens

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import AuthProvider and useAuth
import { AuthProvider, useAuth } from './js/lib/AuthContext';

// ---------- Screen Components ----------
import DashboardScreen from './js/components/DashboardScreen';
import ProviderSearchScreen from './js/components/ProviderSearchScreen';
import AiMatchChat from './js/components/AiMatchChat';
import ProfileScreen from './js/components/ProfileScreen';
import CulturalCalendar from './js/components/CulturalCalendar';
import LoginScreen from './js/components/LoginScreen';

// ---------- Detail Screens (with explicit .js extension) ----------
import ProviderCard from './js/screens/ProviderCard';
import ClaimProfileScreen from './js/screens/ClaimProfileScreen';

// ---------- Theme ----------
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7F8FA',
  },
};

const BLUE = '#2563EB';
const GREEN = '#10B981';

// ---------- Tabs ----------
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'home',
            Provider: 'search',
            'AI Match': 'chatbubbles',
            Profile: 'person',
            Calendar: 'calendar',
          };
          const name = map[route.name] || 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Provider" component={ProviderSearchScreen} />
      <Tab.Screen name="AI Match" component={AiMatchChat} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Calendar" component={CulturalCalendar} />
    </Tab.Navigator>
  );
}

// ---------- Stack Navigator for Main App (includes Tabs + Detail screens) ----------
const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main tabs as the initial screen */}
      <Stack.Screen name="MainTabs" component={Tabs} />
      
      {/* Detail screens that can be navigated to from tabs */}
      <Stack.Screen 
        name="ProviderProfile" 
        component={ProviderCard}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="ClaimProfile" 
        component={ClaimProfileScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="UpdateProfile" 
        component={ClaimProfileScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

// ---------- Root Navigator with Auth Check ----------
function RootNavigator() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  // If no user, show login screen
  if (!user) {
    return <LoginScreen />;
  }

  // If user is logged in, show main stack (which includes tabs + detail screens)
  return <MainStack />;
}

// ---------- App Root ----------
export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={MyTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}