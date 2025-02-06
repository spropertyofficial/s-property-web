/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,mdx}',
    './src/components/**/*.{js,jsx,mdx}',
    './src/app/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3aa9a2',
          dark: '#316f6b',
        },
        secondary: {
          blue: '#3f51b5',
          green: '#4caf50',
          'green-dark': '#1b5e20',
        }
      }
    }
  },
  plugins: [],
}