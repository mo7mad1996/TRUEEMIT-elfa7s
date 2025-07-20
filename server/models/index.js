const fs = require("fs");
const path = require("path");

// where is models directory ?
const models_path = path.join(__dirname, "models");

// import models now!
const models = fs.readdirSync(models_path, "utf-8");
models.forEach((models) => require(path.join(models_path, models)));
