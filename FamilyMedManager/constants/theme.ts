/**
 * Medical app theme based on modern healthcare design patterns
 * Inspired by clean, professional medical interfaces
 */

import { Platform } from 'react-native';

// Primary blue color from the reference design
const primaryBlue = '#5B7FE5';
const primaryBlueDark = '#4A6BD3';

export const theme = {
  colors: {
    // Primary colors matching the reference
    primary: primaryBlue,
    primaryLight: '#7B9AFF',
    primaryDark: primaryBlueDark,

    // Background colors
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    surface: '#FFFFFF',

    // Section Text colors
    sectionTextPrimary: '#FFFFFF',
    sectionTextSecondary: '#FFFFFF',
    sectionTextTertiary: '#FFFFFF',


    // Text colors
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Medical specific colors
    online: '#10B981',
    offline: '#94A3B8',

    // Stock level colors
    stockGood: '#10B981',
    stockLow: '#F59E0B',
    stockCritical: '#EF4444',

    // Border and divider colors
    border: '#E2E8F0',
    divider: '#F1F5F9',

    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',

    // Form field colors for better readability
    fieldDefault: 'rgba(38, 81, 134, 0.57)', // Your requested default field color
    fieldDefaultText: '#FFFFFF',
    fieldDefaultPlaceholder: 'rgba(255, 255, 255, 0.6)',
    fieldDefaultBorder: 'rgba(255, 255, 255, 0.4)',

    fieldSelected: 'rgba(91, 127, 229, 0.8)', // Brighter selected state using primary color
    fieldSelectedText: '#FFFFFF',
    fieldSelectedBorder: '#FFFFFF',

    fieldFocused: 'rgba(91, 127, 229, 0.6)', // Focused state
    fieldFocusedBorder: 'rgba(255, 255, 255, 0.8)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  typography: {
    // Font sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    // Font weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Legacy Colors for backward compatibility
export const Colors = {
  light: {
    text: theme.colors.textPrimary,
    background: theme.colors.background,
    tint: theme.colors.primary,
    icon: theme.colors.textSecondary,
    tabIconDefault: theme.colors.textSecondary,
    tabIconSelected: theme.colors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
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
