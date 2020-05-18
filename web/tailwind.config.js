module.exports = {
  purge: {
    content: ["./**/*.html", "./src/**/*.ts"],
    options: {
      whitelist: ["absolute", "top-0", "right-0"],
    },
  },
  theme: {
    fontFamily: {
      display: ["Varela Round", "sans-serif"],
      body: ["Varela Round", "sans-serif"],
      sans: ["Varela Round", "sans-serif"],
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
