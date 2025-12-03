/**
 * HTW Berlin Theme Configuration
 * Official HTW Berlin Corporate Design Colors
 */

import { Platform } from 'react-native';

// HTW Berlin Official Colors
export const HTWColors = {
  // Primary HTW Green
  primary: '#76B900',      // HTW Grün
  primaryDark: '#5A8F00',  // Dunkleres Grün
  primaryLight: '#9DD129', // Helleres Grün
  
  // Secondary Colors
  secondary: '#1A1A1A',    // Schwarz
  secondaryLight: '#4A4A4A', // Dunkelgrau
  
  // Accent Colors
  accent: '#FFFFFF',       // Weiß
  accentGray: '#F5F5F5',   // Hellgrau
  
  // Semantic Colors
  success: '#76B900',
  warning: '#FFA500',
  error: '#D32F2F',
  info: '#2196F3',
  
  // Text Colors
  text: '#1A1A1A',
  textLight: '#666666',
  textInverse: '#FFFFFF',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  backgroundDark: '#1A1A1A',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
};

// Updated Colors for Light and Dark Mode
export const Colors = {
  light: {
    text: HTWColors.text,
    background: HTWColors.background,
    tint: HTWColors.primary,
    icon: HTWColors.textLight,
    tabIconDefault: HTWColors.textLight,
    tabIconSelected: HTWColors.primary,
    
    // Additional colors
    primary: HTWColors.primary,
    secondary: HTWColors.secondary,
    surface: HTWColors.backgroundGray,
    border: HTWColors.border,
    success: HTWColors.success,
    warning: HTWColors.warning,
    error: HTWColors.error,
  },
  dark: {
    text: HTWColors.textInverse,
    background: HTWColors.backgroundDark,
    tint: HTWColors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: HTWColors.primary,
    
    // Additional colors
    primary: HTWColors.primary,
    secondary: HTWColors.textInverse,
    surface: '#2A2A2A',
    border: '#3A3A3A',
    success: HTWColors.success,
    warning: HTWColors.warning,
    error: HTWColors.error,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};
