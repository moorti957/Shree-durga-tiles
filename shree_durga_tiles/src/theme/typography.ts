import { Platform, type TextStyle } from 'react-native';

const uiFont = Platform.select({ ios: 'Manrope_500Medium', android: 'Manrope_500Medium', default: 'Manrope_500Medium' });
const displayFont = Platform.select({
  ios: 'CormorantGaramond_600SemiBold',
  android: 'CormorantGaramond_600SemiBold',
  default: 'CormorantGaramond_600SemiBold',
});

export const typography = {
  screenTitle: { fontFamily: displayFont, fontSize: 28, lineHeight: 32 },
  screenTitleSmall: { fontFamily: displayFont, fontSize: 26, lineHeight: 30 },
  loginBrand: { fontFamily: displayFont, fontSize: 32, lineHeight: 36 },
  sectionTitle: { fontFamily: displayFont, fontSize: 23, lineHeight: 27 },
  cardTitle: { fontFamily: displayFont, fontSize: 19, lineHeight: 23 },
  statNumber: { fontFamily: displayFont, fontSize: 30, lineHeight: 34 },
  priceBig: { fontFamily: displayFont, fontSize: 42, lineHeight: 46 },
  eyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 13, fontWeight: '700' },
  body: { fontFamily: uiFont, fontSize: 14, fontWeight: '500' },
  small: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, fontWeight: '600' },
  badge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 9, fontWeight: '800' },
  button: { fontFamily: 'Manrope_800ExtraBold', fontSize: 13, fontWeight: '800' },
  navLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, fontWeight: '600' },
  devanagari: { fontFamily: 'NotoSerifDevanagari_600SemiBold', fontSize: 13, fontWeight: '600' },
} satisfies Record<string, TextStyle>;
