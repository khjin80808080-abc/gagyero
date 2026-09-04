/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2fb",
          100: "#d7e0f4",
          200: "#b0c1e9",
          300: "#7f9bd8",
          400: "#4f71bf",
          500: "#2f4f9e",
          600: "#213a7d",
          700: "#182c60",
          800: "#101f46",
          900: "#0a1530",
        },
        teal: {
          50: "#e9fbf8",
          100: "#c8f4ec",
          200: "#94e8db",
          300: "#5cd6c5",
          400: "#2fbfab",
          500: "#17a190",
          600: "#0f8175",
          700: "#0d655d",
          800: "#0b4d47",
          900: "#083733",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 10px rgba(16, 31, 70, 0.08)",
        floating: "0 8px 24px rgba(16, 31, 70, 0.16)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "pop-in": "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-up": "slide-up 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
