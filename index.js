// index.js (project root, sibling of app.json)

// 1) Must run BEFORE anything else that might read location
try {
    // use explicit extension so Metro resolves without guessing
    require('./js/shims/location.js');
  } catch (e) {
    // no-op: if Metro still can’t find it, we’ll fix via cache reset below
  }
  
  // 2) URL polyfill for RN (safe after we created location)
  import 'react-native-url-polyfill/auto';
  
  import { registerRootComponent } from 'expo';
  import App from './App';
  
  // Registers "main" with the runtime
  registerRootComponent(App);
  