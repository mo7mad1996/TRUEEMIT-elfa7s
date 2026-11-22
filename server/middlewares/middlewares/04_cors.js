const cors = require("cors");

const defaultCors = cors({ origin: "*" });

module.exports = (app) =>
  app.use((req, res, next) => {
    const middleware = defaultCors;
    middleware(req, res, next);
  });
