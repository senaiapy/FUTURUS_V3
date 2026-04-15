const NightTheme = {
  // THEME aliases
  background: '#050608',
  card: '#0D0E12',
  cardBorder: 'rgba(255, 181, 36, 0.12)',
  textMain: '#FFFFFF',
  textDim: '#A0AEC0',
  glass: 'rgba(255, 255, 255, 0.03)',

  // CDP aliases
  bg: '#050608',
  surface: '#0D0E12',
  border: 'rgba(255, 181, 36, 0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#718096',
  textDisabled: 'rgba(255,255,255,0.4)',
  glow: 'rgba(255, 181, 36, 0.15)',
  glowMedium: 'rgba(255, 181, 36, 0.25)',
  purple: '#6366F1',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  pulseRing: 'rgba(255, 181, 36, 0.4)',
  successMedium: 'rgba(16, 185, 129, 0.3)',
  successLight: 'rgba(16, 185, 129, 0.15)',
  contentBg: '#08090C',
  contentBorder: '#1C1D24',
  cardDark: '#08090C',

  // Custom states
  tint: '#FFB524',
  game: '#8B5CF6',
  gameDim: 'rgba(139, 92, 246, 0.15)',
  dangerDim: 'rgba(239, 68, 68, 0.15)',

  // Shared
  primary: '#FFB524', // Gold
  secondary: '#E2E8F0', // Platinum
  accent: '#FACC15', // Yellow
  success: '#10B981', // Emerald
  danger: '#EF4444', // Rose/Red
  warning: '#FBBF24',
};

// Based on Laravel "Light Gray & Gold" theme
const LightTheme = {
  // THEME aliases
  background: '#F8FAFC', // Very light slate
  card: '#FFFFFF', // Pure white cards
  cardBorder: 'rgba(255, 181, 36, 0.3)', // Visible gold tone border
  textMain: '#0F172A', // Slate 900
  textDim: '#64748B', // Slate 500
  glass: 'rgba(0, 0, 0, 0.03)', // Subtle dark glass effect

  // CDP aliases
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: 'rgba(255, 181, 36, 0.3)',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textDisabled: 'rgba(0,0,0,0.3)',
  glow: 'rgba(255, 181, 36, 0.15)',
  glowMedium: 'rgba(255, 181, 36, 0.25)',
  purple: '#6366F1',
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
  glassStrong: 'rgba(0, 0, 0, 0.1)',
  pulseRing: 'rgba(255, 181, 36, 0.4)',
  successMedium: 'rgba(16, 185, 129, 0.3)',
  successLight: 'rgba(16, 185, 129, 0.15)',
  contentBg: '#F1F5F9',
  contentBorder: '#E2E8F0',
  cardDark: '#FFFFFF',

  // Custom states
  tint: '#E6A320',
  game: '#7C3AED',
  gameDim: 'rgba(124, 58, 237, 0.15)',
  dangerDim: 'rgba(239, 68, 68, 0.15)',

  // Shared (Gold retains its identity, somewhat deeper for reading on white)
  primary: '#E6A320', // Slightly darker gold for light mode text/buttons
  secondary: '#64748B',
  accent: '#FACC15',
  success: '#059669', // Emerald 600
  danger: '#DC2626', // Red 600
  warning: '#D97706', // Amber 600
};

// Check env var - Expo makes these available at build/runtime
const isFuturus = process.env.EXPO_PUBLIC_APP_NAME === 'Futurus';

// Export unified config based on env
export const THEME = isFuturus ? LightTheme : NightTheme;
export const CDP = THEME;
