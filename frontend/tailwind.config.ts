import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        owner: { 900: "#1A1A2E", 700: "#16213E", accent: "#D4A017" },
        admin: { 900: "#0A1F44", 700: "#1A3A6B", 500: "#2E5EAA" },
        subadmin: { 900: "#0F6E56", 700: "#1D9E75", 500: "#5DCAA5" },
        manager: { 900: "#854F0B", 700: "#BA7517", 500: "#EF9F27" },
        resident: { 900: "#3730A3", 700: "#4338CA", 500: "#6366F1" }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
