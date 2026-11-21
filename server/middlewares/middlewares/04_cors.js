const cors = require("cors");

const totalsCors = cors({
  origin: ["http://localhost:3000", "https://trueemit.dev"],
});
const defaultCors = cors({ origin: "*" });

module.exports = (app) =>
  app.use((req, res, next) => {
    const middleware = /^\/api\/(?:car-totals|user-totals)\/?$/i.test(req.path)
      ? totalsCors
      : defaultCors;
    middleware(req, res, next);
  });
