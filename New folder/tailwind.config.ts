import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0B0E17',
        'space-darker': '#050811',
        'neon-cyan': '#00FFFF',
        'neon-pink': '#FF007F',
        'neon-purple': '#8B00FF',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-bg': 'rgba(255, 255, 255, 0.02)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'grid-move': 'grid-move 20s linear infinite',
        'line-flow': 'line-flow 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.4)' },
        },
        'grid-move': {
          '0%': { transform: 'translateX(-50px) translateY(-50px)' },
          '100%': { transform: 'translateX(0px) translateY(0px)' },
        },
        'line-flow': {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '100' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(45deg, #00FFFF, #FF007F, #8B00FF)',
      },
    },
  },
  plugins: [],
}
export default config