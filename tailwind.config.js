/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // UPDATED: New shadow values for a pure black background
      boxShadow: {
        'neumorphic-outset': '5px 5px 12px #1c1c1c, -5px -5px 12px #3a3a3a',
        'neumorphic-inset': 'inset 5px 5px 12px #1c1c1c, inset -5px -5px 12px #3a3a3a',
      },
    },
  },
  plugins: [],
}