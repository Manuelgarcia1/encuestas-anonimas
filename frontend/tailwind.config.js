/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        gris: '#EDEDED',
        grisOscuro:'#636363',
        negro:'3C323E',
        celeste:'#BDDDF9'
      },
    },
  },
  plugins: [],
}

