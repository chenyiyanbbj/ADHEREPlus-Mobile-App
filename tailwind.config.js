/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAF7F2",
          card: "#FFFFFF",
          amber: "#F5A623",
          "amber-dark": "#D4880A",
          navy: "#1E2D4E",
          border: "#E8DDD0",
          muted: "#9B8B78",
          taken: "#22C55E",
          missed: "#EF4444"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(30, 45, 78, 0.08)"
      }
    }
  },
  plugins: []
};
