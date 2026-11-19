import { Text, View } from 'react-native';
import { colors, radii, typography } from '@/theme';

const palette = {
  live: { backgroundColor: colors.successBg, color: colors.success },
  paid: { backgroundColor: colors.successBg, color: colors.success },
  enquiry: { backgroundColor: colors.brassTint, color: colors.brassDark },
  cod: { backgroundColor: colors.dangerBg, color: colors.danger },
  due: { backgroundColor: colors.dangerBg, color: colors.danger },
  draft: { backgroundColor: colors.stone100, color: colors.muted },
  neutral: { backgroundColor: colors.stone100, color: colors.muted },
} as const;

export function Badge({ label, variant = 'neutral', dot = false }: { label: string; variant?: keyof typeof palette; dot?: boolean }) {
  const style = palette[variant];
  return (
    <View style={{ borderRadius: radii.control, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: style.backgroundColor, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' }}>
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: style.color }} /> : null}
      <Text style={[typography.badge, { color: style.color }]}>{label}</Text>
    </View>
  );
}
