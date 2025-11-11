// js/components/RegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// IMPORTANT — use same import style as LoginScreen
import { default as supabase } from '../supabase';

const GREEN = '#10B981';
const NAVY = '#1F2937';
const INPUT_BG = '#EFE7FB';
const INPUT_BORDER = '#D6CCE9';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert('Registration failed', error.message);
        return;
      }

      Alert.alert(
        'Success!',
        'Account created. Check your email to verify your account.',
        [{ text:'OK', onPress:()=>navigation.navigate('Login') }]
      );
    } catch (e) {
      Alert.alert('Registration failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
          keyboardShouldPersistTaps="handled"
        >

          {/* Logo */}
          <Image
            source={require('../../assets/login-banner.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Brand */}
          <Text style={styles.inclusive}>INCLUSIVE</Text>
          <Text style={styles.healthMatch}>HEALTH MATCH</Text>
          <Text style={styles.welcome}>Create Account</Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              editable={!busy}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              editable={!busy}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrap}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              onSubmitEditing={onRegister}
              editable={!busy}
            />
          </View>

          {/* Register */}
          <TouchableOpacity
            style={[styles.registerBtn, busy && styles.registerBtnDisabled]}
            activeOpacity={0.85}
            onPress={onRegister}
            disabled={busy}
          >
            <Text style={styles.registerText}>{busy ? 'Creating Account…' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrefix}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7} disabled={busy}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1, backgroundColor:'#FFF'},
  flex:{flex:1},
  container:{paddingHorizontal:32, alignItems:'center'},
  logo:{width:'75%', height:120, marginTop:10, marginBottom:20},
  inclusive:{fontSize:36,fontWeight:'900',color:'#000',letterSpacing:0.5,textAlign:'center'},
  healthMatch:{fontSize:36,fontWeight:'900',color:GREEN,letterSpacing:0.5,textAlign:'center',marginTop:-4,marginBottom:16},
  welcome:{fontSize:28,fontWeight:'800',color:NAVY,textAlign:'center',marginBottom:24},
  inputWrap:{width:'100%',marginBottom:16},
  input:{width:'100%',backgroundColor:INPUT_BG,borderColor:INPUT_BORDER,borderWidth:1,borderRadius:12,paddingHorizontal:16,paddingVertical:14,fontSize:16,color:'#111827'},
  registerBtn:{width:'100%',backgroundColor:GREEN,borderRadius:25,paddingVertical:15,alignItems:'center',justifyContent:'center',marginTop:8,shadowColor:'#000',shadowOpacity:0.15,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:3},
  registerBtnDisabled:{opacity:0.6},
  registerText:{color:'#FFF',fontSize:18,fontWeight:'800'},
  loginRow:{flexDirection:'row',alignItems:'center',marginTop:24},
  loginPrefix:{color:NAVY,fontSize:14,fontWeight:'700'},
  loginLink:{color:GREEN,fontSize:14,fontWeight:'700',textDecorationLine:'underline'},
});
