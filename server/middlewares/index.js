// ..:: packages ::..
const fs = require("fs");
const path = require("path");

// where is middleware dir ?
const middlewares_path = path.join(__dirname, "middlewares");

module.exports = async (app) => {
  const middlewares = fs
    .readdirSync(middlewares_path, "utf-8")
    .filter((middleware) => middleware !== "05_nuxt.js")
    .sort();

  for (const middleware of middlewares) {
    await require(path.join(middlewares_path, middleware))(app);
  }
};
