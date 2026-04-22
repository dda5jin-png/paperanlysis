import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff4ff",
          100: "#dbe6fe",
          200: "#bfd4fd",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        ink: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          500: "#64748b",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
      },
      maxWidth: {
        prose: "680px",
      },
    },
  },
  plugins: [],
};

export default config;
