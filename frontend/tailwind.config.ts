import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0F",
          card: "rgba(255, 255, 255, 0.03)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
        },
        accent: {
          green: "#00B894",
          purple: "#6C5CE7",
          yellow: "#FDCB6E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.6)",
          tertiary: "rgba(255, 255, 255, 0.35)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
