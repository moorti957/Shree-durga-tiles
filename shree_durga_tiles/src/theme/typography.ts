import { Platform, type TextStyle } from 'react-native';

const uiFont = Platform.select({ ios: 'Manrope_500Medium', android: 'Manrope_500Medium', default: 'Manrope_500Medium' });
const displayFont = Platform.select({
  ios: 'CormorantGaramond_600SemiBold',
  android: 'CormorantGaramond_600SemiBold',
  default: 'CormorantGaramond_600SemiBold',
});

export const typography = {
  screenTitle: { fontFamily: displayFont, fontSize: 36, lineHeight: 38 },
  screenTitleSmall: { fontFamily: displayFont, fontSize: 32, lineHeight: 34 },
  loginBrand: { fontFamily: displayFont, fontSize: 40, lineHeight: 42 },
  sectionTitle: { fontFamily: displayFont, fontSize: 28, lineHeight: 32 },
  cardTitle: { fontFamily: displayFont, fontSize: 24, lineHeight: 26 },
  statNumber: { fontFamily: displayFont, fontSize: 40, lineHeight: 44 },
  priceBig: { fontFamily: displayFont, fontSize: 60, lineHeight: 64 },
  eyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 14, fontWeight: '700' },
  body: { fontFamily: uiFont, fontSize: 15, fontWeight: '500' },
  small: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, fontWeight: '600' },
  badge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 11, fontWeight: '800' },
  button: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, fontWeight: '800' },
  navLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, fontWeight: '600' },
  devanagari: { fontFamily: 'NotoSerifDevanagari_600SemiBold', fontSize: 15, fontWeight: '600' },
} satisfies Record<string, TextStyle>;
