// Ensure window/global location exists with a safe `origin` before any library loads.
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

if (Platform.OS !== 'web') {
  // Build a stable scheme-based origin (e.g. inclusivehealthmatch://)
  const schemeOrigin = (() => {
    try {
      const url = Linking.createURL('/'); // "<scheme>://"
      const idx = url.indexOf('://');
      return idx > 0 ? url.slice(0, idx + 3) : 'app://';
    } catch {
      return 'app://';
    }
  })();

  const g = globalThis ?? global;
  if (!g.window) g.window = {};
  if (!g.global) g.global = g;

  const ensureLocation = (host) => {
    if (!host.location) host.location = { origin: schemeOrigin };
    else if (!host.location.origin) host.location.origin = schemeOrigin;
  };
  ensureLocation(g);
  ensureLocation(g.window);
}
