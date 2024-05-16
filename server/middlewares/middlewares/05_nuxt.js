// packages
const { Nuxt, Builder } = require("nuxt");
const socketio = require("socket.io");
const open = require("open");

// where is nuxt.config.js file get it...
const config = require("../../../nuxt.config");

const nuxt = new Nuxt(config);
const { host, port } = nuxt.options.server;

// ..:: start function ::..
async function start(app) {
  if (config.dev) {
    // in development
    const builder = new Builder(nuxt);
    await builder.build();
  }
  // in production
  else await nuxt.ready();

  // ..:: render nuxt router ::..
  app.use(nuxt.render);

  // ..:: Running server ::..
  const server = app.listen(port, (_) => {
    console.log(`listen on: http://${host}:${port}`);
    // ..:: open in the brawser in production ::..
    if (!config.dev) open(`http://${host}:${port}`);
  });

  // ..:: socket.io config ::..
  // It depends on a server constant
  const IO = socketio(server);
  require("../../IO")(IO);
}

module.exports = start;
