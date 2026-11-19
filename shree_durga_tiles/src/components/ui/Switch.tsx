import { Pressable, View } from 'react-native';
import { colors } from '@/theme';

export function Toggle({ value, onValueChange, label }: { value: boolean; onValueChange: (value: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      hitSlop={5}
      style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          width: 42,
          height: 24,
          borderRadius: 12,
          backgroundColor: value ? colors.success : colors.switchOff,
          justifyContent: 'center',
          padding: 3,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ height: 18, width: 18, borderRadius: 9, backgroundColor: colors.card }} />
      </View>
    </Pressable>
  );
}
