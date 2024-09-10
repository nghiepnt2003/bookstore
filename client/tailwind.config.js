/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    fontFamily: {
      main: ["Poppins", "sans-serif;"]
    },
    extend: {
      boxShadow: {
        'custom': '6px 6px 5px 0 rgba(92, 92, 92, 0.1)',
      },
      width: {
        main: '1300px'
      },
      backgroundColor: {
        main: '#f73995'
      },
      colors: {
        main: '#f73995'
      },
      keyframes: {
        'slide-top-sm': {
          '0%': { 
            '-webkit-transform': ' translateY(8px);',
            transform: 'translateY(8px);' 
          },
          '100%': { 
            '-webkit-transform': ' translateY(0px);',
            transform: 'translateY(0px);' 
          }
        },
      },
      animation: {
        'slide-top-sm': 'slide-top-sm 0.2s linear both',
      }
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp")
  ],
}
