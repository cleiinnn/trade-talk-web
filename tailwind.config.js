/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandTeal: '#D9E9EE',
        brandBlue: '#4B99D4',
      }
    },
  },
  plugins: [],
}