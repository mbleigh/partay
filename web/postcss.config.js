const plugins =
  process.env.NODE_ENV === "production"
    ? ["tailwindcss", "autoprefixer"]
    : ["tailwindcss"];

module.exports = { plugins };
