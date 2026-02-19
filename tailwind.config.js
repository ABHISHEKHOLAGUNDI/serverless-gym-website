/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816', // Deep Space
        surface: 'rgba(17, 24, 39, 0.7)',
        surfaceHighlight: 'rgba(31, 41, 55, 0.8)',
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          glow: 'rgba(251, 191, 36, 0.5)',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          accent: '#fcd34d', // Amber-300
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        tech: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
