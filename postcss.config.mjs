const config = {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./common/**/*.{js,ts,jsx,tsx,mdx}",
      ],
    },
  },
};

export default config;
