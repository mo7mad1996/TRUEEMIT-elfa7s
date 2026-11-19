const cors = require("cors");

const allowedOrigins = new Set([
	"http://localhost:3000",
	"https://localhost:3000",
	"http://trueemit.dev",
	"https://trueemit.dev",
]);

module.exports = (app) =>
	app.use(
		cors({
			origin(origin, callback) {
				if (!origin || allowedOrigins.has(origin)) return callback(null, true);

				return callback(null, false);
			},
		}),
	);
