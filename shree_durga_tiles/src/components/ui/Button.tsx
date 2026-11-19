import { ActivityIndicator, Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, componentSize, radii, typography } from '@/theme';

type Props = PressableProps & {
  label: string;
  variant?: 'brass' | 'dark' | 'outline' | 'success';
  icon?: LucideIcon;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const buttonColors = {
  brass: { backgroundColor: colors.brassLight, color: colors.ink, borderColor: colors.brassLight },
  dark: { backgroundColor: colors.ink, color: colors.stone, borderColor: colors.ink },
  outline: { backgroundColor: 'transparent', color: colors.ink, borderColor: colors.inputBorder },
  success: { backgroundColor: colors.success, color: colors.card, borderColor: colors.success },
} as const;

export function Button({ label, variant = 'brass', icon: Icon, loading, compact, disabled, style, ...props }: Props) {
  const palette = buttonColors[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: compact ? componentSize.buttonCompact : componentSize.button,
          paddingHorizontal: compact ? 12 : 16,
          borderRadius: radii.control,
          borderWidth: 1,
          borderColor: palette.borderColor,
          backgroundColor: palette.backgroundColor,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 9,
          opacity: disabled || loading ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.color} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {Icon ? <Icon size={18} color={palette.color} strokeWidth={1.8} /> : null}
          <Text allowFontScaling maxFontSizeMultiplier={1.3} style={[typography.button, { color: palette.color }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
