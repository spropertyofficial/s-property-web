/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)', opacity: 1 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up .35s cubic-bezier(.22,.72,.29,1) both',
        'scale-in': 'scale-in .25s cubic-bezier(.22,.72,.29,1) both',
        'fade-in': 'fade-in .3s ease both',
        'slide-up': 'slide-up .25s ease both',
        'sheet-up': 'sheet-up .35s cubic-bezier(.22,.72,.29,1) both'
      },
      gridTemplateColumns: {
        "auto-fit": "repeat(auto-fit, minmax(250px, 1fr))",
        "auto-fill": "repeat(auto-fill, minmax(250px, 1fr))",
      },
      colors: {
        // Palet Tosca
        tosca: {
          50: "#7BFCF3", // Paling Terang
          100: "#4BD3CB",
          200: "#3AA9A2", // Primary
          300: "#2A817B",
          400: "#1B5857",
          500: "#0D3735", // Paling Gelap
        },
        // Palet Biru
        blue: {
          50: "#DAE8FA", // Paling Terang
          100: "#95C3F2",
          200: "#4E9EDD", // Primary
          300: "#3A78A9",
          400: "#275478",
          500: "#051420", // Paling Gelap
        },
        // Palet Hijau
        green: {
          50: "#85FBB3", // Paling Terang
          100: "#4BD487",
          200: "#3AA96B", // Primary
          300: "#2A8050",
          400: "#1B5936",
          500: "#031409", // Paling Gelap
        },
        // Palet Abu-abu
        gray: {
          50: "#E3E9E9", // Paling Terang
          100: "#BCC1C1",
          200: "#969A9A", // Primary
          300: "#727575",
          400: "#505252",
          500: "#131414", // Paling Gelap
        },
      },
    },
  },
  plugins: [],
};
