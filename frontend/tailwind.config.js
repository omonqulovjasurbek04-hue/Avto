/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material Design v2 Dark Mode (Default)
        'bg-main': '#0b0f19',
        'bg-surface': '#151c2c',
        'text-primary': '#ffffff',
        'text-secondary': '#94a3b8',
        'primary-accent': '#3b82f6',
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'glass-bg': 'rgba(30, 41, 59, 0.6)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        
        // Legacy colors (kept for compatibility)
        bg: {
          darkest: '#0b0f19',
          dark: '#151c2c',
          card: '#1e293b',
          elevated: '#26334d',
        },
        brand: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          green: '#10b981',
          red: '#ef4444',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        heading: ['var(--font-outfit)', 'sans-serif'],
        body: ['var(--font-jakarta)', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-primary': '0 0 30px rgba(173, 198, 255, 0.15)',
        'glow-primary-intense': '0 0 40px rgba(173, 198, 255, 0.3)',
        'depth-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      scale: {
        '85': '0.85',
        '98': '0.98',
        '102': '1.02',
        '105': '1.05',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'tilt-enter': 'tiltEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
