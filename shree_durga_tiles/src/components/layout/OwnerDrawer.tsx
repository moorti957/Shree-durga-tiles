import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Boxes, ChevronRight, CircleUserRound, Grid2X2, Home, LogOut,
  MessageSquareText, Plus, Receipt, Settings, Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billsApi } from '@/api/endpoints';
import { useAuthStore } from '@/features/auth/authStore';
import { colors, typography } from '@/theme';

type Props = { visible: boolean; onClose: () => void };

const navItems = [
  { label: 'Home / Dashboard', route: '/(tabs)/home', Icon: Home },
  { label: 'Products', route: '/(tabs)/products', Icon: Boxes },
  { label: 'Add Product', route: '/product/new', Icon: Plus },
  { label: 'Categories', route: '/categories', Icon: Grid2X2 },
  { label: 'Visitors', route: '/(tabs)/visitors', Icon: Users },
  { label: 'Enquiries', route: '/notifications', Icon: MessageSquareText },
  { label: 'Bills', route: '/(tabs)/bills', Icon: Receipt },
  { label: 'Settings', route: '/settings', Icon: Settings },
  { label: 'Account / Profile', route: '/settings', Icon: CircleUserRound },
];

export function OwnerDrawer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const settings = useQuery({ queryKey: ['shop-settings'], queryFn: billsApi.settings, enabled: visible });
  const offset = useRef(new Animated.Value(-320)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(offset, { toValue: 0, duration: 230, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 230, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(offset, { toValue: -320, duration: 190, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 190, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setRendered(false); });
    }
  }, [backdrop, offset, visible]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose, visible]);

  const navigate = (route: string) => {
    onClose();
    router.push(route as never);
  };

  const logout = async () => {
    onClose();
    await clearSession();
    router.replace('/login');
  };

  if (!rendered) return null;

  return (
    <Modal transparent visible={rendered} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: colors.dim, opacity: backdrop }} />
        <Pressable accessibilityLabel="Close owner menu" style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
        <Animated.View
          style={{
            width: 304,
            maxWidth: '86%',
            height: '100%',
            backgroundColor: colors.card,
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom, 10),
            transform: [{ translateX: offset }],
            shadowColor: colors.ink,
            shadowOpacity: 0.28,
            shadowRadius: 18,
            elevation: 20,
          }}
        >
          <View style={{ paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: colors.brassTint, borderWidth: 1, borderColor: colors.brassLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.profileImage ? <Image source={{ uri: user.profileImage }} style={{ width: 48, height: 48 }} /> : settings.data?.logo ? <Image source={{ uri: settings.data.logo }} style={{ width: 48, height: 48 }} /> : <CircleUserRound size={24} color={colors.brassDark} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.cardTitle, { color: colors.ink, fontSize: 20 }]} numberOfLines={1}>{user?.name || 'Owner'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }} />
                  <Text style={[typography.small, { color: colors.success, fontSize: 11 }]}>ACCOUNT ACTIVE</Text>
                </View>
              </View>
              <Pressable onPress={onClose} accessibilityLabel="Close drawer" style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={18} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={[typography.small, { color: colors.muted, marginTop: 8 }]} numberOfLines={1}>{user?.identifier || ''}</Text>
            {user?.mobile ? <Text style={[typography.small, { color: colors.muted, marginTop: 3 }]}>{user.mobile}</Text> : null}
            {settings.data?.phone ? <Text style={[typography.small, { color: colors.muted, marginTop: 3 }]}>{settings.data.phone}</Text> : null}
            <Text style={[typography.small, { color: colors.brassDark, marginTop: 3 }]}>{user?.role || 'owner'} / Administrator</Text>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8 }}>
            {navItems.map(({ label, route, Icon }) => {
              const active = pathname === route || (route === '/(tabs)/home' && pathname === '/(tabs)');
              return (
                <Pressable key={label} onPress={() => navigate(route)} style={{ minHeight: 42, borderRadius: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: active ? colors.brassTint : 'transparent' }}>
                  <Icon size={17} color={active ? colors.brassDark : colors.muted} strokeWidth={1.8} />
                  <Text style={[typography.label, { flex: 1, color: active ? colors.ink : colors.muted, fontSize: 12 }]}>{label}</Text>
                  <ChevronRight size={15} color={active ? colors.brassDark : colors.muted} />
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable onPress={() => void logout()} accessibilityRole="button" accessibilityLabel="Logout" style={{ marginHorizontal: 16, minHeight: 44, borderRadius: 8, backgroundColor: colors.dangerBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={17} color={colors.danger} />
            <Text style={[typography.label, { color: colors.danger }]}>Logout</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
