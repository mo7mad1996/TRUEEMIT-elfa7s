const bodyParser = require("body-parser");

module.exports = (app) => {
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false, limit: "25mb" }));

  // parse application/json
  app.use(bodyParser.json({ limit: "25mb" }));
};
