/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0F1115',
          secondary: '#171A21',
          tertiary:  '#1E2128',
        },
        accent: {
          purple: '#8B5CF6',
          pink:   '#EC4899',
          purpleHover: '#7C3AED',
          pinkHover:   '#DB2777',
        },
        text: {
          primary:   '#F3F4F6',
          secondary: '#9CA3AF',
          muted:     '#6B7280',
        },
        border: {
          DEFAULT: '#2D3139',
          light:   '#3D4149',
        },
      },
      fontFamily: {
        sans:    ['Outfit', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        xl:   '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card:   '0 4px 20px rgba(0,0,0,0.4)',
        glow:   '0 0 20px rgba(139,92,246,0.3)',
        glowPink: '0 0 20px rgba(236,72,153,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'purple-pink': 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}