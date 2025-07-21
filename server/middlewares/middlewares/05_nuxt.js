// packages
const socketIo = require("socket.io");
const open = require("open");
const { Nuxt, Builder } = require("nuxt");

// where is nuxt.config.js file get it...
const config = require("../../../nuxt.config");

const nuxt = new Nuxt(config);
let { host, port } = config.server;

// ..:: start function ::..
async function start(app) {
  if (config.dev) {
    // in development
    const builder = new Builder(nuxt);
    await builder.build();
    app.use(nuxt.render);
    // port = 3001;
  }
  // in production
  else {
    await nuxt.ready();

    // ..:: render nuxt router ::..
    app.use(nuxt.render);
  }

  // ..:: Running server ::..
  const server = app.listen(config.dev ? 3001 : port, (_) => {
    console.log(`listen on: http://${host}:${port}`);
    // ..:: open in the browser in production ::..
    if (!config.dev) open(`http://${host}:${port}`);
  });

  global.server = server;

  // ..:: socket.io config ::..
  // It depends on a server constant
  const IO = socketIo(server);
  require("../../IO")(IO);
}

module.exports = start;
