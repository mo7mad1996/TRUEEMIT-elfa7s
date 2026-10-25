const { networkInterfaces } = require("os");

const dev = process.env.NODE_ENV == "development";

/**
 * Pick the LAN IPv4 that another device on the same network (e.g. the phone
 * scanning the QR code) can actually reach. The old code took the first
 * interface blindly, which on many machines is a dead "Local Area Connection"
 * holding a 169.254.* APIPA address, or a virtual switch (vEthernet / WSL /
 * VirtualBox) — none of which a phone can open.
 */
function pickLanIP() {
  const nets = networkInterfaces();

  // interface names that are almost never the real LAN adapter
  const virtualRe =
    /(vethernet|virtualbox|vmware|hyper-?v|default switch|wsl|loopback|tailscale|zerotier|hamachi|vswitch|docker|tap-|npcap)/i;

  const candidates = [];
  for (const [name, addrs] of Object.entries(nets)) {
    for (const net of addrs || []) {
      if (net.family !== "IPv4") continue;
      if (net.internal) continue; // loopback
      if (net.address.startsWith("169.254.")) continue; // APIPA link-local
      candidates.push({ name, address: net.address });
    }
  }

  if (!candidates.length) return "127.0.0.1";

  const score = ({ name, address }) => {
    let s = 0;
    if (/^192\.168\./.test(address)) s += 40; // classic home / office LAN
    else if (/^10\./.test(address)) s += 35;
    else if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(address)) s += 10; // often virtual
    if (virtualRe.test(name)) s -= 50; // strongly avoid virtual adapters
    if (/wi-?fi|wlan|ethernet|lan|local area/i.test(name)) s += 5;
    return s;
  };

  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0].address;
}

const IP = pickLanIP();
const port = 3000;

module.exports = {
  server: {
    port,
    host: IP,
  },
  dev,
  telemetry: false,

  hooks: {
    // @nuxtjs/tailwindcss@4 injects a v2-style `purge` key into the merged
    // config. Tailwind v3 reads `content` (set in tailwind.config.js) and only
    // warns about the leftover legacy key, so drop it before postcss sees it.
    "tailwindcss:config": (tailwindConfig) => {
      delete tailwindConfig.purge;
    },
  },

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
    { src: "~/plugins/view-job.js" },
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
    baseURL: `http://${IP}:${dev ? 3000 : port}/api`,
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
