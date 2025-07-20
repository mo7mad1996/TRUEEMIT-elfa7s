const fs = require("fs-extra");
const files = [
  "assets",
  "components",
  "layouts",
  "middleware",
  "pages",
  "plugins",
  "store",
  ".git",
  ".gitignore",
  "TRUEEMIT-elfa7s-main",
  "remove.js",
];

files.forEach((name) => {
  fs.removeSync(name);
});
