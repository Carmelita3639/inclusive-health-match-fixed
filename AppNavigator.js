// js/navigation/AppNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---- Real screens ----
import DashboardScreen from '../components/DashboardScreen';
import ProviderSearchScreen from '../components/ProviderSearchScreen';
import AiMatchChat from '../components/AiMatchChat';
import ProfileScreen from '../components/ProfileScreen';
import CulturalCalendar from '../components/CulturalCalendar';
import ProviderCard from '../screens/ProviderCard';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarLabel = (emoji, label, focused) => (
  <Text
    style={{
      fontSize: 12,
      fontWeight: focused ? '800' : '600',
      color: focused ? '#10B981' : '#111827',
    }}
  >
    {emoji} {label}
  </Text>
);

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 58,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelPosition: 'below-icon', // (we're not using icons; this keeps spacing nice)
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: ({ focused }) => TabBarLabel('🏠', 'Home', focused) }}
      />
      <Tab.Screen
        name="Provider"
        component={ProviderSearchScreen}
        options={{ tabBarLabel: ({ focused }) => TabBarLabel('🔍', 'Provider', focused) }}
      />
      <Tab.Screen
        name="AIMatch"
        component={AiMatchChat}
        options={{ tabBarLabel: ({ focused }) => TabBarLabel('💬', 'AI Match', focused) }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: ({ focused }) => TabBarLabel('👤', 'Profile', focused) }}
      />
      <Tab.Screen
        name="Calendar"
        component={CulturalCalendar}
        options={{ tabBarLabel: ({ focused }) => TabBarLabel('📅', 'Calendar', focused) }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* The emoji tab bar lives here, once */}
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        {/* Provider details from search results */}
        <Stack.Screen
          name="ProviderCard"
          component={ProviderCard}
          options={{ title: 'Provider Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
