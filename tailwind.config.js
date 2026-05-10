/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: "#060B22",
          dark: "#0F1A3D",
          DEFAULT: "#1B2B5C",
        },
        accent: {
          DEFAULT: "#C9A961",
          light: "#D9BC75",
        },
        sand: "#F5F2EC",
        ice: "#D9E2F0",
        gray: {
          dark: "#2C3E50",
          medium: "#5D6D7E",
          light: "#C8D0DA",
        },
        signal: {
          green: "#2E7D5B",
          amber: "#B8821F",
          red: "#8B2E2E",
        },
      },
      fontFamily: {
        display: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
