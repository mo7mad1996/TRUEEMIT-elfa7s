// packages
const { Nuxt, Builder } = require("nuxt");
const socketio = require("socket.io");
const open = require("open");

const config = require("../../../nuxt.config");

const nuxt = new Nuxt(config);
const { host, port } = nuxt.options.server;

// ..:: start function ::..
async function start(app) {
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }
  // ..:: render nuxt router ::..
  app.use(nuxt.render);

  // ..:: Running server ::..
  const server = app.listen(port, (_) => {
    console.log(`listen on: http://${host}:${port}`);
    // ..:: open in the brawser ::..
    if (!config.dev) open(`http://${host}:${port}`);
  });

  const IO = socketio(server);

  const handeler = require("../../IO")(IO);
}

module.exports = start;
