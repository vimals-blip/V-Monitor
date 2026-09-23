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
        noc: {
          bg: '#0B0F17',
          surface: '#121824',
          card: '#161F30',
          border: '#222E45',
          cyan: '#00F2FE',
          blue: '#4FACFE',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
}
