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
          primary: "#0F1117",
          surface: "#171A24",
          elevated: "#1C2030",
        },
        border: {
          DEFAULT: "#252A38",
          hover: "#353A4D",
        },
        accent: {
          teal: "#2DD4A8",
          "teal-dim": "#1A8B6E",
          "teal-bg": "rgba(45, 212, 168, 0.094)",
          orange: "#F59E42",
          "orange-dim": "#B87420",
          "orange-bg": "rgba(245, 158, 66, 0.094)",
        },
        text: {
          primary: "#E8ECF0",
          secondary: "#8B93A8",
          tertiary: "#5A6275",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
