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
  // "install.bat",
  "remove.js",
];

files.forEach((name) => {
  fs.removeSync(name);
});
