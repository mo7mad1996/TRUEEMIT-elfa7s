const fs = require("fs-extra");
const files = [
  "assets",
  "components",
  "layouts",
  "middleware",
  "pages",
  "plugins",
  "store",
  // "install.bat",
  ".git",
  ".gitignore",
  "remove.js",
];

files.forEach((name) => {
  fs.removeSync(name);
});
