const cors = require("cors");

module.exports = (app) =>
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
