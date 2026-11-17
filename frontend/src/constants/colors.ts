// frontend/src/constants/colors.ts

// ============================================================
// Brand Color Palette
// ============================================================

/**
 * Main brand colors for the storefront
 */
export const brandColors = {
  /** Primary red */
  gold: '#FF0000',
  /** Secondary yellow accent */
  goldLight: '#FFFF00',
  /** Primary red */
  goldDark: '#FF0000',
  marbleWhite: '#FFFFFF',
  templeIvory: '#000000',
  deepMaroon: '#FF0000',
  maroonDark: '#FF0000',
  maroonLight: '#FF0000',
  lightSand: '#111111',
  royalBrown: '#FFFFFF',
  brownLight: '#FFFFFF',
  brownDark: '#111111',
  premiumBlack: '#000000',
  ivory: '#000000',
  sand: '#111111',
  brown: '#FFFFFF',
} as const;

// ============================================================
// Color Shades (light to dark variants)
// ============================================================

/**
 * Gold shades - from lightest to darkest
 */
export const goldShades = {
  50: '#FFFF00',
  100: '#FFFF00',
  200: '#FFFF00',
  300: '#FFFF00',
  400: '#FFFF00',
  500: '#FF0000',
  600: '#FF0000',
  700: '#FF0000',
  800: '#FF0000',
  900: '#FF0000',
} as const;

/**
 * Maroon shades - from lightest to darkest
 */
export const maroonShades = {
  50: '#FF0000',
  100: '#FF0000',
  200: '#FF0000',
  300: '#FF0000',
  400: '#FF0000',
  500: '#FF0000',
  600: '#FF0000',
  700: '#FF0000',
  800: '#FF0000',
  900: '#FF0000',
} as const;

/**
 * Brown shades - from lightest to darkest
 */
export const brownShades = {
  50: '#111111',
  100: '#111111',
  200: '#111111',
  300: '#333333',
  400: '#333333',
  500: '#FFFFFF',
  600: '#FFFFFF',
  700: '#FFFFFF',
  800: '#FFFFFF',
  900: '#FFFFFF',
} as const;

/**
 * Sand/Ivory shades
 */
export const neutralShades = {
  50: '#FFFFFF',
  100: '#FFFFFF',
  200: '#111111',
  300: '#111111',
  400: '#111111',
  500: '#333333',
  600: '#333333',
  700: '#333333',
  800: '#333333',
  900: '#333333',
} as const;

/**
 * Black shades (premium dark tones)
 */
export const blackShades = {
  50: '#FFFFFF',
  100: '#FFFFFF',
  200: '#FFFFFF',
  300: '#FFFFFF',
  400: '#FFFFFF',
  500: '#333333',
  600: '#333333',
  700: '#111111',
  800: '#111111',
  900: '#000000',
} as const;

// ============================================================
// Complete Color Map
// ============================================================

/**
 * Complete color palette with all variants and utilities
 */
export const colors = {
  // Main brand colors (for direct use)
  brand: brandColors,
  
  // Shades
  gold: goldShades,
  maroon: maroonShades,
  brown: brownShades,
  neutral: neutralShades,
  black: blackShades,

  // Semantic color groups
  primary: {
    main: brandColors.gold,
    light: brandColors.goldLight,
    dark: brandColors.goldDark,
    contrast: brandColors.marbleWhite,
  },
  secondary: {
    main: '#111111',
    light: brandColors.maroonLight,
    dark: brandColors.maroonDark,
    contrast: brandColors.marbleWhite,
  },
  accent: {
    main: '#FFFF00',
    light: '#FFFF00',
    dark: '#FFFF00',
    contrast: brandColors.marbleWhite,
  },
  background: {
    default: '#000000',
    paper: '#111111',
    accent: '#111111',
    dark: '#000000',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    muted: '#FFFFFF',
    light: brandColors.marbleWhite,
    inverse: brandColors.marbleWhite,
  },
  status: {
    success: '#2E7D32',
    error: '#FF0000',
    warning: '#FFFF00',
    info: '#FF0000',
  },
} as const;

// ============================================================
// CSS Variable Mappings (for Tailwind config)
// ============================================================

/**
 * CSS variable names for Tailwind theme extension
 * Use these in your tailwind.config.js
 */
export const cssVariables = {
  // Brand colors
  gold: 'var(--gold)',
  goldLight: 'var(--gold-light)',
  goldDark: 'var(--gold-dark)',
  marbleWhite: 'var(--marble-white)',
  templeIvory: 'var(--temple-ivory)',
  deepMaroon: 'var(--deep-maroon)',
  maroonDark: 'var(--maroon-dark)',
  maroonLight: 'var(--maroon-light)',
  lightSand: 'var(--light-sand)',
  royalBrown: 'var(--royal-brown)',
  brownLight: 'var(--brown-light)',
  brownDark: 'var(--brown-dark)',
  premiumBlack: 'var(--premium-black)',
  ivory: 'var(--ivory)',
  sand: 'var(--sand)',
  brown: 'var(--brown)',
} as const;

/**
 * CSS variable definitions for :root
 * Copy these into your globals.css
 */
export const cssVariableDefinitions: Record<string, string> = {
  '--gold': brandColors.gold,
  '--gold-light': brandColors.goldLight,
  '--gold-dark': brandColors.goldDark,
  '--marble-white': brandColors.marbleWhite,
  '--temple-ivory': brandColors.templeIvory,
  '--deep-maroon': brandColors.deepMaroon,
  '--maroon-dark': brandColors.maroonDark,
  '--maroon-light': brandColors.maroonLight,
  '--light-sand': brandColors.lightSand,
  '--royal-brown': brandColors.royalBrown,
  '--brown-light': brandColors.brownLight,
  '--brown-dark': brandColors.brownDark,
  '--premium-black': brandColors.premiumBlack,
  '--ivory': brandColors.ivory,
  '--sand': brandColors.sand,
  '--brown': brandColors.brown,
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get a color by name from the brand colors
 */
export function getColor(name: keyof typeof brandColors): string {
  return brandColors[name] || brandColors.gold;
}

/**
 * Check if a color is light (for text contrast decisions)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128;
}

/**
 * Get contrast color (black or white) based on background
 */
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? brandColors.premiumBlack : brandColors.marbleWhite;
}

/**
 * Convert hex to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Get a shade from the color palette by percentage (0-100)
 * Returns the closest matching shade
 */
export function getShade(colorName: keyof typeof brandColors, percentage: number): string {
  const shadeMap: Record<keyof typeof brandColors, Record<number, string>> = {
    gold: { ...goldShades },
    deepMaroon: { ...maroonShades },
    maroonDark: { ...maroonShades },
    maroonLight: { ...maroonShades },
    royalBrown: { ...brownShades },
    brownLight: { ...brownShades },
    brownDark: { ...brownShades },
    premiumBlack: { ...blackShades },
    ivory: { ...neutralShades },
    sand: { ...neutralShades },
    templeIvory: { ...neutralShades },
    marbleWhite: { ...neutralShades },
    lightSand: { ...neutralShades },
    brown: { ...brownShades },
    goldLight: { ...goldShades },
    goldDark: { ...goldShades },
  };

  const shades = shadeMap[colorName];
  if (!shades) return brandColors[colorName];

  // Find closest shade based on percentage
  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const closest = shadeKeys.reduce((prev, curr) => {
    return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev;
  });
  
  return shades[closest as keyof typeof shades] || shades[500] || brandColors[colorName];
}

// ============================================================
// Gradient Definitions
// ============================================================

/**
 * Premium gradient combinations for your brand
 */
export const gradients = {
  /** Gold to gold-dark gradient */
  gold: `linear-gradient(135deg, ${brandColors.gold}, ${brandColors.goldDark})`,
  /** Maroon to maroon-dark gradient */
  maroon: `linear-gradient(135deg, ${brandColors.deepMaroon}, ${brandColors.maroonDark})`,
  /** Warm ivory to sand gradient */
  warm: `linear-gradient(135deg, ${brandColors.ivory}, ${brandColors.lightSand})`,
  /** Gold to transparent (for hero overlays) */
  goldTransparent: `linear-gradient(180deg, ${brandColors.gold}20, transparent)`,
  /** Dark to transparent (for image overlays) */
  darkOverlay: `linear-gradient(180deg, transparent, ${brandColors.premiumBlack}80)`,
  /** Premium black to brown */
  darkWarm: `linear-gradient(135deg, ${brandColors.premiumBlack}, ${brandColors.royalBrown})`,
  /** Gold to maroon (luxury accent) */
  goldMaroon: `linear-gradient(135deg, ${brandColors.gold}, ${brandColors.deepMaroon})`,
  /** Light gradient for cards */
  cardLight: `linear-gradient(135deg, ${brandColors.marbleWhite}, ${brandColors.lightSand}30)`,
  /** Glass gradient */
  glass: `linear-gradient(135deg, ${brandColors.marbleWhite}30, ${brandColors.marbleWhite}10)`,
} as const;

// ============================================================
// Shadow Definitions
// ============================================================

/**
 * Premium shadow presets using brand colors
 */
export const shadows = {
  /** Subtle shadow */
  sm: `0 4px 20px ${brandColors.premiumBlack}10`,
  /** Medium shadow */
  md: `0 8px 40px ${brandColors.premiumBlack}15`,
  /** Large shadow */
  lg: `0 20px 60px ${brandColors.premiumBlack}20`,
  /** Extra large shadow */
  xl: `0 30px 80px ${brandColors.premiumBlack}25`,
  /** Gold glow shadow */
  gold: `0 12px 40px ${brandColors.gold}40`,
  /** Maroon shadow */
  maroon: `0 12px 40px ${brandColors.deepMaroon}30`,
  /** Soft warm shadow */
  warm: `0 20px 60px ${brandColors.royalBrown}15`,
  /** Inner glow */
  inner: `inset 0 2px 4px ${brandColors.marbleWhite}20, inset 0 -2px 4px ${brandColors.premiumBlack}05`,
} as const;

// ============================================================
// Border Definitions
// ============================================================

/**
 * Premium border presets
 */
export const borders = {
  /** Gold border */
  gold: `1px solid ${brandColors.gold}40`,
  /** Gold solid border */
  goldSolid: `1px solid ${brandColors.gold}`,
  /** Maroon border */
  maroon: `1px solid ${brandColors.deepMaroon}30`,
  /** Brown border */
  brown: `1px solid ${brandColors.royalBrown}20`,
  /** Light border */
  light: `1px solid ${brandColors.brownLight}20`,
  /** White border with opacity */
  white: `1px solid ${brandColors.marbleWhite}20`,
  /** Premium dark border */
  dark: `1px solid ${brandColors.premiumBlack}20`,
} as const;

// ============================================================
// Default Export
// ============================================================

const colorConstants = {
  brand: brandColors,
  colors,
  goldShades,
  maroonShades,
  brownShades,
  neutralShades,
  blackShades,
  cssVariables,
  cssVariableDefinitions,
  gradients,
  shadows,
  borders,
  getColor,
  isLightColor,
  getContrastColor,
  hexToRgb,
  getShade,
};

export default colorConstants;