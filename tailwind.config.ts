import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-fond': '#F4D6D2',
        'rose-poudre': '#FF85A1', // Un rose plus vif pour les accents
        'creme': '#FFFDF9',
        'orange-doux': '#FFB38E',
        'rouge-cerise': '#D2143A', // Le rouge cerise Y2K
        'texte-gris': '#4A4A4A',
      },
      borderRadius: {
        'journal': '30px', // Des coins encore plus arrondis pour le côté sticker
      },
    },
  },
  plugins: [],
};
export default config;