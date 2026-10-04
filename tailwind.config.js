/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nikkei: {
          dark: '#0a0d14',
          card: '#121824',
          cardHover: '#1a2234',
          border: '#232e42',
          gold: '#f59e0b',
          goldGlow: '#fbbf24',
          emerald: '#10b981',
          cyan: '#06b6d4',
          crimson: '#ef4444',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.25)',
      }
    },
  },
  plugins: [],
}
