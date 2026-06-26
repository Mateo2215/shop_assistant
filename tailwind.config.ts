import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        market: {
          bg: '#161c17',
          header: '#1b231d',
          surface: '#1e2620',
          raised: '#222b24',
          elevated: '#28312a',
          border: 'rgba(255,255,255,0.06)',
          divider: 'rgba(255,255,255,0.04)',
          text: '#eef3ec',
          muted: '#9aa79c',
          subtle: '#7d8a80',
          lightBg: '#f4f1e8',
          lightSurface: '#fffefb',
          lightRaised: '#efe9dc',
          lightBorder: '#e8e3d8',
          lightInput: '#e3ddcf',
          lightText: '#1f2a22',
          lightMuted: '#626a5e',
          lightSubtle: '#8a8171',
        },
        fresh: {
          violet: '#a98bf0',
          violetLight: '#8b6fe0',
          green: '#7fcb9e',
          greenStrong: '#237a50',
          greenSoft: '#5cc08a',
          blue: '#6f8fc4',
          amber: '#f4c25a',
          danger: '#e45f6d',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'check-pop': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.35)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'check-pop': 'check-pop 0.3s ease-out forwards',
        'slide-in':  'slide-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
