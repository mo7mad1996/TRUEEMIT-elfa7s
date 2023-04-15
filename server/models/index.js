const fs = require("fs");
const path = require("path");

const modles_path = path.join(__dirname, "models");

const modles = fs.readdirSync(modles_path, "utf-8");
modles.forEach((modle) => require(path.join(modles_path, modle)));
