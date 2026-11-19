console.clear();

// ..:: packages ::..
const express = require("express");

// ..:: Constants ::..
const app = express();

// ..:: models ::..
require("./models");

async function start() {
	await require("./middlewares")(app);
	if (!process.env.SECRET) throw new Error("SECRET is required");
	await require("./utils/inspectionCenter").initialize();
	await require("./routes")(app, express);
	await require("./middlewares/middlewares/05_nuxt")(app);
}

start().catch((error) => {
	console.error("Server startup failed:", error);
	process.exit(1);
});
