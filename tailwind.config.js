/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crisis: {
          red: '#B91C1C',
          'red-light': '#DC2626',
          'red-dark': '#991B1B',
          'red-darker': '#7F1D1D',
          amber: '#D97706',
          blue: '#1D4ED8',
          'blue-light': '#2563EB',
        },
        surface: {
          DEFAULT: '#FAFAF9',
          dark: '#0B0F19',
          elevated: '#FFFFFF',
          'elevated-dark': '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.25rem, 4vw + 1rem, 4rem)', { lineHeight: '1.05', fontWeight: '800' }],
        'display': ['clamp(1.75rem, 2vw + 1rem, 2.5rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'headline': ['clamp(1.25rem, 1vw + 1rem, 1.5rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'lead': ['clamp(1.05rem, 0.5vw + 0.95rem, 1.15rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'prose': '70ch',
        '8xl': '90rem',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'lift': '0 4px 6px rgba(0,0,0,0.03), 0 10px 24px rgba(0,0,0,0.08)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
