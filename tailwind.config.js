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
        primary: {
          50: '#f2f9f9',
          100: '#e1f2f2',
          200: '#c5e5e6',
          300: '#9cd1d3',
          400: '#6ab3b6',
          500: '#4e979a',
          600: '#3d7b7e',
          700: '#356567',
          800: '#305355',
          900: '#2b4648',
          950: '#192b2d',
        },
        secondary: {
          50: '#f6f5fa',
          100: '#ecebf4',
          200: '#dbd9ea',
          300: '#c1bdda',
          400: '#a19bc6',
          500: '#837bb0',
          600: '#6d639b',
          700: '#5d5386',
          800: '#4f4670',
          900: '#433c5e',
          950: '#29243b',
        },
      },
    },
  },
  plugins: [],
}
