/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        midnight: {
          950: '#070a14',
          900: '#0c1020',
          850: '#11182c',
          800: '#17213b',
        },
        glossy: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#a18cd1',
          pink: '#fbc2eb',
          emerald: '#00f2fe',
        }
      },
      boxShadow: {
        'glossy-sm': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 4px 16px 0 rgba(0, 0, 0, 0.3)',
        'glossy-md': 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glossy-lg': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.4), 0 16px 48px 0 rgba(0, 0, 0, 0.5)',
        'neon-glow': '0 0 30px -5px rgba(79, 172, 254, 0.5)',
        'neon-purple': '0 0 30px -5px rgba(168, 85, 247, 0.5)',
        'neon-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'float-reverse 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(20px) scale(0.95)' },
        },
        'pulse-glow': {
          '0%': { opacity: '0.3', transform: 'scale(1)' },
          '100%': { opacity: '0.6', transform: 'scale(1.15)' },
        }
      }
    },
  },
  plugins: [],
};
