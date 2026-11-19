import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, componentSize, radii, spacing, typography } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  leftText?: string;
  secureToggle?: boolean;
};

export function TextField({ label, error, leftText, secureToggle, secureTextEntry, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.ink }]}>{label}</Text>
      <View
        style={{
          minHeight: props.multiline ? 84 : componentSize.input,
          borderRadius: radii.control,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.inputBorder,
          backgroundColor: colors.card,
          flexDirection: 'row',
          alignItems: props.multiline ? 'flex-start' : 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: props.multiline ? spacing.sm : 0,
        }}
      >
        {leftText ? <Text style={[typography.body, { color: colors.muted }]}>{leftText}</Text> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry && !visible}
          autoCapitalize={props.autoCapitalize ?? 'none'}
          allowFontScaling
          maxFontSizeMultiplier={1.3}
          style={[typography.body, { flex: 1, color: colors.ink, paddingVertical: 0, minHeight: props.multiline ? 62 : undefined, textAlignVertical: props.multiline ? 'top' : 'center' }, style]}
          {...props}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            onPress={() => setVisible((value) => !value)}
            hitSlop={8}
            style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            {visible ? <EyeOff size={20} color={colors.muted} /> : <Eye size={20} color={colors.muted} />}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[typography.small, { color: colors.danger, fontSize: 11 }]}>{error}</Text> : null}
    </View>
  );
}
