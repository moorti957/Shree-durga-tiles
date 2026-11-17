import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

type Props = ViewProps & { scroll?: boolean; contentContainerStyle?: ScrollViewProps['contentContainerStyle']; bottomInset?: number };

export function Screen({ scroll = true, contentContainerStyle, bottomInset = 20, style, children, ...props }: Props) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.stone }}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: bottomInset }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...props as ScrollViewProps}
        >
          <View style={[{ width: '100%', maxWidth: 520, alignSelf: 'center', flex: 1 }, style]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }, style]} {...props}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
