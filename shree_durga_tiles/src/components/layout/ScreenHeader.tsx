import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, typography } from '@/theme';

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
    <View style={{ backgroundColor: colors.charcoal, borderBottomLeftRadius: radii.container, borderBottomRightRadius: radii.container, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {back ? (
          <Pressable onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" style={{ width: 38, height: 38, borderRadius: radii.control, borderColor: 'rgba(237,234,228,0.3)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={colors.stone} strokeWidth={1.8} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1, gap: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[typography.screenTitleSmall, { color: colors.stone }]}>{title}</Text>
          {subtitle ? <Text style={[typography.small, { color: colors.mutedOnDark }]}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}
