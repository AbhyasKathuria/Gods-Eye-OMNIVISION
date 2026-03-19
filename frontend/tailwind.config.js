/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: '#ff0000',
        'danger-dark': '#cc0000',
        'danger-dim': '#440000',
        'danger-glow': '#ff4400',
        'bg-base': '#000000',
        'bg-panel': '#030000',
        'bg-card': '#060000',
        'bg-hover': '#0d0000',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        'blink': 'blink 0.6s infinite',
        'scan': 'scan 2s linear infinite',
        'ticker': 'ticker 12s linear infinite',
        'expand-ring': 'expandRing 2.5s ease-out infinite',
        'hot-pulse': 'hotpulse 0.8s infinite',
        'core-pulse': 'corePulse 0.5s infinite',
        'radar-sweep': 'sweep 3s linear infinite',
        'outer-pulse': 'outerPulse 2s ease-in-out infinite',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        scan: { '0%': { top: 0 }, '100%': { top: '100%' } },
        ticker: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-200%)' } },
        expandRing: {
          '0%': { r: '8', opacity: '1', strokeWidth: '2' },
          '100%': { r: '155', opacity: '0', strokeWidth: '0.2' }
        },
        hotpulse: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
        corePulse: { '0%,100%': { r: '6', opacity: 1 }, '50%': { r: '10', opacity: 0.6 } },
        sweep: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        outerPulse: {
          '0%,100%': { strokeWidth: '1.5', stroke: '#ff0000' },
          '50%': { strokeWidth: '3', stroke: '#ff4400' }
        },
      }
    },
  },
  plugins: [],
}