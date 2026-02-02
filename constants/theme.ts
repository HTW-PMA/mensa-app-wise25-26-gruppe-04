/**
 * UniMensa Berlin Theme Configuration
 * Neutral Apple-like Design System
 */

import { Platform } from 'react-native';

// UniMensa Berlin Neutral Colors (Apple-like)
export const UniColors = {
  primary: '#0A2540',
  primaryDark: '#081C33',
  primaryLight: '#3A5A7A',

  secondary: '#111827',
  secondaryLight: '#6B7280',

  accent: '#FFFFFF',
  accentGray: '#F2F3F5',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  text: '#0F172A',
  textLight: '#6B7280',
  textInverse: '#FFFFFF',

  background: '#F7F8FA',
  backgroundGray: '#F2F3F5',
  backgroundCard: '#FFFFFF',
  backgroundDark: '#0B1220',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: 'rgba(0,0,0,0.08)',
};

// Alias für alten Code (damit HTWColors.primary weiter funktioniert)
export const HTWColors = UniColors;

// Light / Dark Mode
export const Colors = {
  light: {
    text: UniColors.text,
    background: UniColors.background,
    tint: UniColors.primary,
    icon: UniColors.textLight,
    tabIconDefault: UniColors.textLight,
    tabIconSelected: UniColors.primary,

    primary: UniColors.primary,
    secondary: UniColors.secondary,
    surface: UniColors.backgroundCard,
    border: UniColors.border,
    success: UniColors.success,
    warning: UniColors.warning,
    error: UniColors.error,
  },
  dark: {
    text: UniColors.textInverse,
    background: UniColors.backgroundDark,
    tint: UniColors.primaryLight,
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: UniColors.primaryLight,

    primary: UniColors.primaryLight,
    secondary: UniColors.textInverse,
    surface: '#1F2933',
    border: '#374151',
    success: UniColors.success,
    warning: UniColors.warning,
    error: UniColors.error,
  },
};

// Apple-like Fonts
export const Fonts = Platform.select({
  ios: {
    sans: 'SF Pro Display',
    serif: 'New York',
    rounded: 'SF Pro Rounded',
    mono: 'SF Mono',
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// Spacing
export const Spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  xxl: 64,
};

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999,
};

// Shadow Presets
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};