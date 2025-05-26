/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          background: '#E8F9FF',
          'background-dark': '#0F172A',
          text: '#1A1B41',
          'text-dark': '#E2E8F0',
          interactive: '#7A89C2',
          'interactive-dark': '#8B9DD1',
          accent: '#DBD053',
          'accent-dark': '#EDE185',
          energetic: '#FFA500',
          'energetic-dark': '#FFB733',
          card: '#FFFFFF',
          'card-dark': '#1E293B',
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'celebrate': 'celebrate 1s ease-in-out',
        'wiggle': 'wiggle 0.8s ease-in-out infinite',
        'subtle-float': 'subtleFloat 3s ease-in-out infinite alternate',
        'icon-pop': 'iconPop 0.5s ease-out',
        'gentle-pulse': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bell-ring': 'bellRing 2.5s ease-in-out infinite', 
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
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg) scale(1.0)' },
          '50%': { transform: 'rotate(2deg) scale(1.03)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        iconPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3) rotate(-5deg)' },
          '100%': { transform: 'scale(1)' },
        },
        // Keyframes for bellRing
        bellRing: {
          '0%, 100%': { transform: 'rotate(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'rotate(-8deg)' },
          '20%, 40%, 60%, 80%': { transform: 'rotate(8deg)' },
          '95%': {transform: 'scale(1.1)'} // subtle pop at the end of sequence
        }
      },
    },
  },
  plugins: [],
};