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
  "temp-repo.zip",
  "remove.js",
];

// leftover extract folder, named after the branch: TRUEEMIT-elfa7s-<branch>
fs.readdirSync(".").forEach((name) => {
  if (/^TRUEEMIT-elfa7s-/.test(name)) files.push(name);
});

files.forEach((name) => {
  fs.removeSync(name);
});
