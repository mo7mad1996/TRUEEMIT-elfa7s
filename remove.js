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

// leftover extracted folders: TRUEEMIT-elfa7s-<branch>
fs.readdirSync(".").forEach((name) => {
	if (/^project-/.test(name)) files.push(name);
});

files.forEach((name) => {
	fs.removeSync(name);
});
