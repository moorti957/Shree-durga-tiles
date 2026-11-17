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
      style={{ minWidth: 52, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 16,
          backgroundColor: value ? colors.success : colors.switchOff,
          justifyContent: 'center',
          padding: 3,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ height: 22, width: 22, borderRadius: 11, backgroundColor: colors.card }} />
      </View>
    </Pressable>
  );
}
