// App.js - Complete working version
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all working components
import LoginScreen from './js/components/LoginScreen';
import SignUpScreen from './js/components/SignUpScreen';
import ForgotPasswordScreen from './js/components/ForgotPasswordScreen';
import DashboardScreen from './js/components/DashboardScreen';
import ProviderSearchScreen from './js/components/ProviderSearchScreen';
import AiMatchChat from './js/components/AiMatchChat';
import CulturalCalendar from './js/components/CulturalCalendar';
import ProfileScreen from './js/components/ProfileScreen';

// Import AuthProvider
import { AuthProvider } from './js/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ProviderSearchScreen" component={ProviderSearchScreen} />
          <Stack.Screen name="AiMatchChat" component={AiMatchChat} />
          <Stack.Screen name="CulturalCalendar" component={CulturalCalendar} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}