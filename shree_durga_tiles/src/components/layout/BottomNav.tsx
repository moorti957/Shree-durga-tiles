import { Pressable, Text, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Home, Layers, Plus, Receipt, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@/theme';

const items = [
  { route: '/(tabs)/home', label: 'Home', Icon: Home },
  { route: '/(tabs)/products', label: 'Products', Icon: Layers },
  { route: '/product/new', label: 'Add', Icon: Plus, fab: true },
  { route: '/(tabs)/visitors', label: 'Visitors', Icon: Users },
  { route: '/(tabs)/bills', label: 'Bills', Icon: Receipt },
];

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ minHeight: 58 + insets.bottom, paddingBottom: insets.bottom, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.card, borderTopColor: colors.line, borderTopWidth: 1, paddingHorizontal: 4 }}>
      {items.map(({ route, label, Icon, fab }) => {
        const active = pathname.includes(route.split('/').pop() ?? '');
        return (
          <Pressable
            key={route}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => router.push(route as never)}
            style={{ flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            {fab ? (
              <>
                <View style={{ width: 30, height: 28, borderRadius: 8, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} strokeWidth={2} color={colors.ink} />
                </View>
                <Text style={[typography.navLabel, { color: colors.brassDark }]}>{label}</Text>
              </>
            ) : (
              <>
                <Icon size={19} strokeWidth={1.8} color={active ? colors.brassDark : colors.tabInactive} />
                <Text style={[typography.navLabel, { color: active ? colors.brassDark : colors.tabInactive, fontWeight: active ? '800' : '600' }]}>{label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
