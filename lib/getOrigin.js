// js/lib/getOrigin.js
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * Use this instead of `window.location.origin` anywhere in the app.
 * Works on web and native.
 */
export function getOrigin() {
  return Platform.OS === 'web' ? window.location.origin : Linking.createURL('/');
}
