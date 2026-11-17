import { Pressable, Text } from 'react-native';
import { colors, typography } from '@/theme';

export function Chip({ label, selected, onPress, dashed }: { label: string; selected?: boolean; onPress?: () => void; dashed?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: selected ? colors.ink : dashed ? colors.brassDark : colors.inputBorder,
        backgroundColor: selected ? colors.ink : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[typography.small, { color: selected ? colors.stone : dashed ? colors.brassDark : colors.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}
