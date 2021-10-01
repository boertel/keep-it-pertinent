module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      outline: {
        "on-hover": "2px solid var(--tw-outline-color)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
