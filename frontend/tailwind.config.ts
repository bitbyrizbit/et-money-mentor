import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'et-red': '#e63329',
        'et-gold': '#c8920a',
        'surface-container-low': '#111111',
        'surface-container': '#201f1f',
        'surface-container-high': '#1c1b1b',
        'surface-container-highest': '#353534',
        'surface-bright': '#3a3939',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#e5bdb8',
        'outline-variant': '#5c403c',
        'secondary': '#adc6ff',
        'secondary-container': '#4b8eff',
        'on-secondary-container': '#00285c',
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.5)' },
          '70%': { boxShadow: '0 0 0 6px rgba(34,197,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'fade-up': 'fadeUp 0.45s ease forwards',
        shimmer: 'shimmer 1.4s infinite',
        'spin-slow': 'spin 0.8s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
