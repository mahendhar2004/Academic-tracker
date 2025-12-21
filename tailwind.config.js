/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Addictive" Palette - Instagram-inspired polished feel
        brand: {
          primary: '#8B5CF6', // Violet
          secondary: '#06B6D4', // Cyan
          accent: '#F43F5E', // Rose
        },
        dark: {
          bg: '#000000',
          surface: '#121212',
          card: '#18181b',
          border: '#27272a',
        },
        light: {
          bg: '#ffffff',
          surface: '#fafafa',
          card: '#ffffff',
          border: '#e4e4e7',
        }
      },
      // UPDATED: New shadow values for a pure black background
      boxShadow: {
        'neumorphic-outset': '5px 5px 12px #1c1c1c, -5px -5px 12px #3a3a3a',
        'neumorphic-inset': 'inset 5px 5px 12px #1c1c1c, inset -5px -5px 12px #3a3a3a',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}