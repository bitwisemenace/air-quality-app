/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050b18',
          900: '#0a1428',
          800: '#0f1c38',
          700: '#162748',
          600: '#1e3358',
          500: '#2a4570',
        },
        aqi: {
          good: '#4ade80',
          satisfactory: '#a3e635',
          moderate: '#facc15',
          poor: '#fb923c',
          veryPoor: '#f87171',
          severe: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
