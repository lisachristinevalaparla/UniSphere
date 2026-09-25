/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#f8f9fd',
          100: '#f1f3fa',
          200: '#e6e9f6',
          300: '#d9def0',
          400: '#c2c8e0',
        },
        charcoal: {
          950: '#0a0a0c',
          900: '#111215',
          850: '#16171b',
          800: '#1c1e24',
          700: '#272a33',
          600: '#3a3e4b',
        },
        sage: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#16a34a',
        },
        primary: {
          50: '#f4f4f6',
          100: '#e5e7eb',
          200: '#d1d5db',
          500: '#111827',
          600: '#000000',
          900: '#111827',
        },
        surface: {
          light: '#f8f9fd',
          dark: '#111215',
        },
        card: {
          light: '#ffffff',
          dark: '#18191d',
        },
        border: {
          light: '#e2e5f0',
          dark: '#26282e',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        'pill': '9999px',
        '2.5xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 12px 36px rgba(0, 0, 0, 0.07)',
        'pill': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'pill-dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
