/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080a',
          900: '#0c0e12',
          850: '#11141a',
          800: '#161a22',
          750: '#1c212c',
          700: '#232936',
          600: '#323a4d',
        },
        sharp: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e63946',
          600: '#d90429',
          700: '#b91c1c',
          glow: 'rgba(230, 57, 70, 0.35)',
        },
        accent: {
          cyan: '#06d6a0',
          blue: '#3a86ff',
          amber: '#ffb703',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'sharp-glow': '0 0 25px -5px rgba(230, 57, 70, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.85), 0 0 20px -2px rgba(230, 57, 70, 0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-grid': 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
