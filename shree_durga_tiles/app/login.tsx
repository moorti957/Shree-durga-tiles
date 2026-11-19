import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fingerprint, Lock } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Svg, { Circle, Path } from 'react-native-svg';
import { authApi } from '@/api/endpoints';
import { normalizeApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { TrishulIcon } from '@/components/brand/TrishulIcon';
import { isBiometricEnabled, setBiometricEnabled, useAuthStore } from '@/features/auth/authStore';
import { unlockWithBiometrics } from '@/features/auth/biometric';
import { colors, typography } from '@/theme';

function Mandala() {
  return (
    <Svg width={310} height={310} viewBox="0 0 390 390" style={{ position: 'absolute', top: 22, alignSelf: 'center' }}>
      <Circle cx="195" cy="195" r="187" stroke={colors.brassLight} strokeOpacity={0.12} strokeWidth="1" />
      <Circle cx="195" cy="195" r="145" stroke={colors.brassLight} strokeOpacity={0.13} strokeWidth="1" />
      <Circle cx="195" cy="195" r="112" stroke={colors.brassLight} strokeOpacity={0.12} strokeWidth="1" strokeDasharray="3 7" />
      {Array.from({ length: 12 }, (_, index) => (
        <Path key={index} d="M195 46 C215 85 215 112 195 140 C175 112 175 85 195 46Z" transform={`rotate(${index * 30} 195 195)`} stroke={colors.brassLight} strokeOpacity={0.1} />
      ))}
    </Svg>
  );
}

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  useEffect(() => {
    void isBiometricEnabled().then(setBiometricAvailable);
  }, []);

  const signIn = async () => {
    if (!identifier.trim() || !password) {
      setError('Enter your login ID and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const session = await authApi.login(identifier.trim(), password);
      await setSession(session.admin, session.accessToken, session.refreshToken);
      const [hardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (hardware && enrolled) {
        await setBiometricEnabled(true);
        setBiometricAvailable(true);
      }
      router.replace('/(tabs)/home');
    } catch (reason) {
      const issue = normalizeApiError(reason);
      setError(issue.code === 'ACCOUNT_LOCKED' ? 'Account locked, try after 15 min' : issue.code === 'INVALID_CREDENTIALS' ? 'Wrong ID or password' : issue.message);
    } finally {
      setLoading(false);
    }
  };

  const fingerprint = async () => {
    try {
      if (await unlockWithBiometrics()) router.replace('/(tabs)/home');
      else Alert.alert('Fingerprint unavailable', 'Sign in once on this device to enable biometric unlock.');
    } catch {
      Alert.alert('Biometric unlock failed', 'Please sign in with your password.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.stone }} keyboardShouldPersistTaps="handled">
          <View style={{ height: 310, overflow: 'hidden', backgroundColor: colors.charcoal, alignItems: 'center', paddingTop: 12 }}>
            <View style={{ position: 'absolute', top: 0, left: -12, right: -12, flexDirection: 'row', justifyContent: 'space-around' }}>
              {Array.from({ length: 17 }, (_, index) => (
                <View key={index} style={{ width: 30, height: 15, backgroundColor: colors.sindoor, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }} />
              ))}
            </View>
              <Mandala />
              <View style={{ marginTop: 53, height: 68, width: 68, borderRadius: 14, borderWidth: 1, borderColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}>
                <TrishulIcon size={38} />
            </View>
              <Text style={[typography.loginBrand, { color: colors.stone, marginTop: 8 }]}>Shree Durga Tiles</Text>
              <Text style={[typography.eyebrow, { color: colors.brassLight, letterSpacing: 2, marginTop: 2 }]}>ADMIN APP</Text>
              <Text style={[typography.devanagari, { color: colors.brassLight, marginTop: 6 }]}>॥ जय माता दी ॥</Text>
          </View>
            <View style={{ marginTop: -16, backgroundColor: colors.stone, borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 12 }}>
            <View style={{ gap: 2, marginBottom: 2 }}>
                <Text style={[typography.sectionTitle, { color: colors.ink }]}>Welcome back</Text>
              <Text style={[typography.small, { color: colors.muted }]}>Sign in to manage your shop and website.</Text>
            </View>
            <TextField label="Mobile number or email" placeholder="Enter your login ID" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" returnKeyType="next" />
            <TextField label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry secureToggle onSubmitEditing={() => void signIn()} />
            {error ? <Text style={[typography.small, { color: colors.danger }]}>{error}</Text> : null}
            <Button label="Sign in →" variant="dark" loading={loading} onPress={() => void signIn()} />
            {biometricAvailable ? <Button label="Use fingerprint" variant="outline" icon={Fingerprint} onPress={() => void fingerprint()} /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 5 }}>
              <Lock size={15} color={colors.muted} strokeWidth={1.8} />
              <Text style={[typography.small, { color: colors.muted }]}>Private app for the shop owner only</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
