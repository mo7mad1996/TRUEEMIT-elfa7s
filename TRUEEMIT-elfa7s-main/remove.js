const fs = require("fs-extra");
const files = [
  "assets",
  "components",
  "layouts",
  "middleware",
  "pages",
  "plugins",
  "store",
  "TRUEEMIT-elfa7s-main",
  // "install.bat",
  "remove.js",
];

files.forEach((name) => {
  fs.removeSync(name);
});
