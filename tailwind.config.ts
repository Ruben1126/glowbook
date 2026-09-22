import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#161616",
        paper: "#fdfcfb",
        brand: {
          DEFAULT: "#b4574a",
          dark: "#8f3f34",
          light: "#f4e3df",
        },
      },
    },
  },
  plugins: [],
};

export default config;
