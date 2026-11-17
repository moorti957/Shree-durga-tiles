import { View, type ViewProps } from 'react-native';
import { colors } from '@/theme';

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 22,
          borderColor: colors.line,
          borderWidth: 1,
          padding: 16,
        },
        style,
      ]}
      {...props}
    />
  );
}
