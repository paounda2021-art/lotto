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
          dark: '#140b04',
          card: '#1c1007',
          cardHover: '#2a190d',
          border: 'rgba(245, 158, 11, 0.35)',
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
        'glow-purple': '0 0 25px rgba(168, 85, 247, 0.25)',
        'glow-pink': '0 0 25px rgba(236, 72, 153, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
