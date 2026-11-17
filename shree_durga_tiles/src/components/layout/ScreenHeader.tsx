import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, typography } from '@/theme';

export function ScreenHeader({
  title,
  subtitle,
  back,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View style={{ backgroundColor: colors.charcoal, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22, gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {back ? (
          <Pressable onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" style={{ width: 44, height: 44, borderRadius: 22, borderColor: 'rgba(237,234,228,0.3)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color={colors.stone} strokeWidth={1.8} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[typography.screenTitleSmall, { color: colors.stone }]}>{title}</Text>
          {subtitle ? <Text style={[typography.small, { color: colors.mutedOnDark }]}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}
