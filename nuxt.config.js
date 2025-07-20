const { networkInterfaces } = require("os");

const nets = networkInterfaces();

const IP = Object.values(nets)[0].find((el) => el.family == "IPv4").address;
const port = 3000;

module.exports = {
  server: {
    port,
    host: IP,
  },
  dev: process.env.NODE_ENV == "development",

  telemetry: false,

  router: {
    middleware: ["valdation", "auth"],
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1,  user-scalable=off",
      },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    "~/assets/scss/tailwind.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
    "~/assets/scss/reset.scss",
    "~/assets/scss/globals.scss",
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: "~/plugins/apex-chart.js", mode: "client" },
    { src: "~/plugins/particles.js", mode: "client" },
    { src: "~/plugins/barcode.js", mode: "client" },
    { src: "~/plugins/v-click-outside.js", mode: "client" },
    { src: "~/plugins/fontawesome.js" },
    { src: "~/plugins/filter.js" },
    { src: "~/plugins/check_max_lines.js" },
    { src: "~/plugins/shop.js" },
    { src: "~/plugins/inputs.js" },
    { src: "~/plugins/nltobr.js" },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: ["@nuxtjs/google-fonts", "@nuxtjs/moment"],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // socket.io
    "nuxt-socket-io",
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",

    "@nuxtjs/auth-next",

    "@nuxtjs/tailwindcss",
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: `http://${IP}:${
      process.env.NODE_ENV == "development" ? 3001 : port
    }/api`,
  },
  io: {
    // module options
    sockets: [{ name: "home" }],
  },
  googleFonts: {
    download: true,
    families: {
      Alexandria: true,
    },
  },
  moment: {
    defaultLocale: "ar",
    locales: ["ar"],
  },

  auth: {
    redirect: {
      login: "/login",
      logout: "/login",
    },
    strategies: {
      local: {
        token: {
          property: "token",
          global: true,
          type: "",
        },
        endpoints: {
          login: { url: "/users/login", method: "post", propertyName: "token" },
          user: { url: "/users/user", method: "get" },
          logout: false,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
