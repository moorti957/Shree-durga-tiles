import { Pressable, Text, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Home, Layers, Plus, Receipt, Users } from 'lucide-react-native';
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
  return (
    <View style={{ height: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.card, borderTopColor: colors.line, borderTopWidth: 1, paddingHorizontal: 4 }}>
      {items.map(({ route, label, Icon, fab }) => {
        const active = pathname.includes(route.split('/').pop() ?? '');
        return (
          <Pressable
            key={route}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => router.push(route as never)}
            style={{ flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: fab ? 0 : 4 }}
          >
            {fab ? (
              <View style={{ width: 58, height: 58, marginTop: -32, borderRadius: 29, borderWidth: 4, borderColor: colors.stone, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center', shadowColor: colors.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 9, elevation: 8 }}>
                <Icon size={24} strokeWidth={2.2} color={colors.ink} />
              </View>
            ) : (
              <>
                <Icon size={22} strokeWidth={1.8} color={active ? colors.brassDark : colors.tabInactive} />
                <Text style={[typography.navLabel, { color: active ? colors.brassDark : colors.tabInactive, fontWeight: active ? '800' : '600' }]}>{label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
