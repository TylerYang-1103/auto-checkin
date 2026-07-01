/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.72)',
          medium: 'rgba(255, 255, 255, 0.50)',
          border: 'rgba(255, 255, 255, 0.18)',
          shadow: 'rgba(31, 38, 135, 0.15)',
        },
        dark: {
          50: '#f8f9fc',
          100: '#eef0f6',
          200: '#d5dae6',
          300: '#b0b8cc',
          400: '#8590ad',
          500: '#5f6b8a',
          600: '#3d4760',
          700: '#2c3147',
          800: '#1a1e2e',
          900: '#111318',
        },
        accent: {
          blue: '#4b6bff',
          purple: '#7c3aed',
          pink: '#ec4899',
          cyan: '#06b6d4',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.20)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
        'glow': '0 0 20px rgba(75, 107, 255, 0.25)',
        'card': '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08), 0 24px 56px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(75, 107, 255, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(75, 107, 255, 0.5)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
