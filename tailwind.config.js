/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          background: '#E8F9FF',  // Very Light Sky Blue
          'background-dark': '#0F172A', // Dark slate blue
          text: '#1A1B41',        // Deep Indigo/Navy Blue
          'text-dark': '#E2E8F0', // Light gray for dark mode
          interactive: '#7A89C2', // Periwinkle/Light Slate Blue
          'interactive-dark': '#8B9DD1', // Lighter periwinkle for dark mode
          accent: '#DBD053',      // Muted Gold/Olive Yellow
          'accent-dark': '#EDE185', // Lighter gold for dark mode
          energetic: '#FFA500',   // Warm Orange
          'energetic-dark': '#FFB733', // Lighter orange for dark mode
          card: '#FFFFFF',        // Pure White
          'card-dark': '#1E293B', // Dark blue-gray for cards in dark mode
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'celebrate': 'celebrate 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        celebrate: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
};