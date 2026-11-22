const assert = require("assert");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const userId = new mongoose.Types.ObjectId();
jwt.verify = () => ({ id: String(userId) });
const User = mongoose.model("Users", new mongoose.Schema({ job: String }));
User.findById = () => ({
	select: async () => ({ _id: userId, job: "exclusive" }),
});
require("../server/models/models/car-exclusive");
const Car = mongoose.model("Car-exclusive");
let saved;
Car.prototype.save = async function () {
	saved = this;
};
Car.findOneAndUpdate = async () => ({});

const app = express();
app.use(express.json());
app.use("/cars-exclusive", require("../server/routes/pages/cars-exclusive")(express.Router()));
const server = app.listen(0, "127.0.0.1", async () => {
	try {
		const base = `http://127.0.0.1:${server.address().port}/cars-exclusive`;
		const post = (path, body) =>
			fetch(base + path, {
				method: "POST",
				headers: { authorization: "test-token", "content-type": "application/json" },
				body: JSON.stringify(body),
			});

		for (const videos of [undefined, [], [null], [{ video: "" }], [{ video: "  " }]]) {
			const response = await post("/save", { videos });
			assert.strictEqual(response.status, 400);
			assert.ok((await response.json()).error);
			assert.strictEqual(saved, undefined);
		}

		const response = await post("/save", {
			videos: [{ video: "https://example.test/car.mp4" }],
			user: new mongoose.Types.ObjectId().toString(),
		});
		assert.strictEqual(response.status, 200);
		assert.strictEqual(String(saved.user), String(userId));
		assert.strictEqual(saved.videos[0].video, "https://example.test/car.mp4");

		const legacyUpdate = await post("/update", { _id: new mongoose.Types.ObjectId(), videos: [] });
		assert.strictEqual(legacyUpdate.status, 200);
		console.log("Exclusive video save checks passed.");
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	} finally {
		server.close();
	}
});
