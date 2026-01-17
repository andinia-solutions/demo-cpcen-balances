/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a4b8f',
          50: '#e6f0f9',
          100: '#cce1f3',
          200: '#99c3e7',
          300: '#66a5db',
          400: '#3387cf',
          500: '#0a4b8f',
          600: '#083c72',
          700: '#062d56',
          800: '#041e39',
          900: '#020f1d',
        },
        secondary: {
          DEFAULT: '#1a6eb5',
          50: '#e8f2fa',
          100: '#d1e5f5',
          200: '#a3cbeb',
          300: '#75b1e1',
          400: '#4797d7',
          500: '#1a6eb5',
          600: '#155891',
          700: '#10426d',
          800: '#0a2c48',
          900: '#051624',
        },
        accent: {
          DEFAULT: '#00b4b4',
          50: '#e6f9f9',
          100: '#ccf3f3',
          200: '#99e7e7',
          300: '#66dbdb',
          400: '#33cfcf',
          500: '#00b4b4',
          600: '#009090',
          700: '#006c6c',
          800: '#004848',
          900: '#002424',
        },
        success: '#22c55e',
        error: '#ef4444',
        background: '#f5f7fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

