import { View, type ViewProps } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.card,
          borderColor: colors.line,
          borderWidth: 1,
          padding: spacing.md,
        },
        style,
      ]}
      {...props}
    />
  );
}
