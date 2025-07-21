/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    enabled: true,
    content: [
      "./components/**/*.{vue,js,ts}",
      "./layouts/**/*.{vue,js,ts}",
      "./pages/**/*.{vue,js,ts}",
      "./plugins/**/*.{js,ts}",
      "./nuxt.config.{js,ts}",
      "./app.vue",
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "",
};
