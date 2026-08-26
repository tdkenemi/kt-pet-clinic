/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2fcf5',
          100: '#e1f8ea',
          200: '#c3efd5',
          300: '#94dfb9',
          400: '#5ec695',
          500: '#35a977',
          600: '#25875e',
          700: '#1e6b4d',
          800: '#1b553f',
          900: '#164634',
        },
        gold: {
          50: '#fdfbfa',
          100: '#fbf5f0',
          200: '#f5e8db',
          300: '#ecd2bc',
          400: '#e0b596',
          500: '#d49670',
          600: '#c77850',
          700: '#a65e3e',
          800: '#864c35',
          900: '#6d402e',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 12px 32px -8px rgba(0, 0, 0, 0.08)',
        'glow-brand': '0 8px 24px -4px rgba(37, 135, 94, 0.3)',
        'glow-gold': '0 8px 24px -4px rgba(212, 150, 112, 0.3)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
