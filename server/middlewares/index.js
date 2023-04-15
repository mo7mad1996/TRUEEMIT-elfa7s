// ..:: packages ::..
const fs = require("fs");
const path = require("path");

const middlewares_path = path.join(__dirname, "middlewares");

module.exports = async (app) => {
  middlewares = await fs.readdirSync(middlewares_path, "utf-8");

  middlewares.forEach((middleware) =>
    require(path.join(middlewares_path, middleware))(app)
  );
};
