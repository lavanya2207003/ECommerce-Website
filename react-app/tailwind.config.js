/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C3AED', dark: '#6D28D9', light: 'rgba(124,58,237,0.1)' },
        secondary: { DEFAULT: '#EC4899', dark: '#DB2777', light: 'rgba(236,72,153,0.1)' },
        accent: { DEFAULT: '#F59E0B', dark: '#D97706', light: 'rgba(245,158,11,0.1)' },
        surface: { DEFAULT: '#FFFFFF', alt: '#F1F5F9', hover: '#FAF5FF' },
        text: { primary: '#1F2937', secondary: '#6B7280', muted: '#9CA3AF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '24px',
      },
    },
  },
  plugins: [],
};
