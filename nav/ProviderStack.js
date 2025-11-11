// js/nav/ProviderStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProviderSearchScreen from '../components/ProviderSearchScreen';
import ProviderCard from '../screens/ProviderCard';

const Stack = createNativeStackNavigator();

export default function ProviderTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderSearch" component={ProviderSearchScreen} />
      <Stack.Screen name="ProviderCard" component={ProviderCard} />
    </Stack.Navigator>
  );
}
