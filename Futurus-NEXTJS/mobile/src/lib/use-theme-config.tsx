import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useUniwind } from 'uniwind';

import colors from '@/components/ui/colors';

/**
 * Premium Theme Configuration
 * Based on Figma design (futurus.fig)
 *
 * Dark theme uses dark blue (#060714) matching Figma design
 * Primary color is Indigo (#6366F1) for premium feel
 */

// Extended colors for custom components (game screens, etc.)
export const extendedColors = {
  // Semantic colors
  success: colors.success[500],
  successLight: colors.success[400],
  warning: colors.warning[500],
  warningLight: colors.warning[400],
  danger: colors.danger[500],
  dangerLight: colors.danger[400],
  info: colors.accent[500],
  infoLight: colors.accent[400],

  // Text colors
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.tertiary,
  textDisabled: colors.text.disabled,

  // Surface colors
  cardBackground: colors.dark[200],
  surfaceElevated: colors.dark[100],

  // Primary variants
  primaryLight: colors.primary[400],
  secondary: colors.secondary[500],
  secondaryLight: colors.secondary[400],
};

// Extended theme type
export type ExtendedTheme = Theme & {
  colors: Theme['colors'] & typeof extendedColors;
};

const DarkTheme: ExtendedTheme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[500],
    background: colors.dark[950],
    text: colors.text.primary,
    border: 'rgba(255, 255, 255, 0.08)',
    card: colors.dark[200],
    notification: colors.accent[500],
    ...extendedColors,
  },
};

const LightTheme: ExtendedTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    background: colors.white,
    text: colors.dark[900],
    border: colors.dark[200],
    card: colors.dark[50],
    notification: colors.primary[500],
    // Extended colors for light mode
    success: colors.success[600],
    successLight: colors.success[500],
    warning: colors.warning[600],
    warningLight: colors.warning[500],
    danger: colors.danger[600],
    dangerLight: colors.danger[500],
    info: colors.accent[600],
    infoLight: colors.accent[500],
    textPrimary: colors.dark[900],
    textSecondary: colors.dark[600],
    textTertiary: colors.dark[500],
    textDisabled: colors.dark[400],
    cardBackground: colors.dark[100],
    surfaceElevated: colors.dark[50],
    primaryLight: colors.primary[400],
    secondary: colors.secondary[500],
    secondaryLight: colors.secondary[400],
  },
};

export function useThemeConfig(): ExtendedTheme {
  const { theme: colorScheme } = useUniwind();

  if (colorScheme === 'dark')
    return DarkTheme;

  return LightTheme;
}
