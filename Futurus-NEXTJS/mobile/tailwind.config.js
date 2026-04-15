const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        'inter-light': ['Inter_300Light'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      colors,
      // Enhanced spacing for better touch targets (minimum 44-48px)
      spacing: {
        '11': '2.75rem',   // 44px - iOS minimum
        '12': '3rem',      // 48px - Android minimum
        '13': '3.25rem',   // 52px
        '14': '3.5rem',    // 56px - Android recommended
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
      },
      // Border radius following Material 3 guidelines
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      // Box shadows for elevation
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'elevated': '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      // Animation timings
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      // Font sizes following iOS Dynamic Type & Material 3 scales
      fontSize: {
        // Caption / Small text
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        // Body text
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        // Headlines
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
      },
      // Opacity for glass effects
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
      // Background opacity
      backgroundOpacity: {
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
    },
  },
  plugins: [],
};
