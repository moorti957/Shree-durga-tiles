import { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_500Medium,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { NotoSerifDevanagari_600SemiBold } from '@expo-google-fonts/noto-serif-devanagari';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { queryClient } from '@/api/queryClient';
import { useAuthStore } from '@/features/auth/authStore';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    NotoSerifDevanagari_600SemiBold,
  });
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        {!fontsLoaded || !initialized ? (
          <View style={{ flex: 1, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.brassLight} />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.stone } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/new" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="bill/new" />
            <Stack.Screen name="bill/[id]" />
            <Stack.Screen name="enquiry/[id]" />
            <Stack.Screen name="settings" />
          </Stack>
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.stone, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text style={{ color: colors.brassDark, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>SHREE DURGA TILES</Text>
      <Text style={{ color: colors.ink, fontSize: 26, fontWeight: '700' }}>Something went wrong</Text>
      <Text accessibilityRole="alert" style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Button label="Go back" onPress={() => router.back()} />
      <Button label="Try again" variant="outline" onPress={retry} />
    </View>
  );
}
