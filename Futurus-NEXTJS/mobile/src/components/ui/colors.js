// @ts-nocheck
/**
 * Futurus Design System - Color Palette
 * Based on Figma design (futurus.fig)
 *
 * Key principles:
 * - Dark blue background (#060714) matching Figma design
 * - Purple/Indigo primary for premium feel
 * - Carefully calibrated text colors for eye comfort
 * - Platform-aware semantic colors
 */

module.exports = {
  white: '#ffffff',
  black: '#000000',

  // Deep OLED Black / Gray for Premium Night
  dark: {
    50: '#2A2D35',
    100: '#23252E',
    200: '#1C1D24', // Surface Top
    300: '#16171D',
    400: '#111216',
    500: '#0C0D10',
    600: '#08090C',
    700: '#050608',
    800: '#030304',
    900: '#010102',
    950: '#000000', // OLED Black
  },

  charcoal: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Primary - Premium Gold
  primary: {
    50: '#FFF9E6',
    100: '#FFEDC2',
    200: '#FFDF99',
    300: '#FFD170',
    400: '#FFC347',
    500: '#FFB524', // Rich Gold
    600: '#E6A320',
    700: '#BF881B',
    800: '#996D16',
    900: '#735110',
    950: '#4D360B',
  },

  // Secondary - Subtle Warm Platinum/Silver
  secondary: {
    50: '#F5F6F8',
    100: '#E6E9EF',
    200: '#CFD5DF',
    300: '#B0B9C6',
    400: '#8E9BAF',
    500: '#718096', // Platinum
    600: '#5A677D',
    700: '#4A5568',
    800: '#3E4656',
    900: '#343B4A',
    950: '#232833',
  },

  accent: {
    50: '#FFFAED',
    100: '#FFF2D6',
    200: '#FFE5B3',
    300: '#FFD78A',
    400: '#FFCB66',
    500: '#FFBE42', // Accent Gold
    600: '#E6A531',
    700: '#BF8524',
    800: '#99671B',
    900: '#734B13',
    950: '#402607',
  },

  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },

  warning: {
    50: '#FFFDEB',
    100: '#FEF8C7',
    200: '#FDF08A',
    300: '#FCE64D',
    400: '#FBDC24',
    500: '#F5D00B',
    600: '#D9B506',
    700: '#B49309',
    800: '#92750E',
    900: '#785F0F',
    950: '#453503',
  },

  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB', // Light Gray
    tertiary: '#9CA3AF',
    disabled: '#6B7280',
    inverse: '#000000',
  },

  glass: {
    light: 'rgba(255, 255, 255, 0.03)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 215, 0, 0.15)', // Subtle gold border
    borderLight: 'rgba(255, 215, 0, 0.3)',
  },

  gradient: {
    primary: ['#FFC347', '#FFB524'], // Gold Gradient
    secondary: ['#E6A320', '#996D16'],
    background: ['#0C0D10', '#050608'], // Premium Night
    card: ['#1A1C23', '#111216'], // Dark Surface
  },
};
