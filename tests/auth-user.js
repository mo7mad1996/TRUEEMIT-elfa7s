const assert = require("assert");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

process.env.SECRET = "test-secret";
const User = mongoose.model("Users", new mongoose.Schema({ name: String }));
const id = new mongoose.Types.ObjectId().toString();
User.findById = async (value) => (value === id ? { _id: id, name: "Test" } : null);

const app = express();
app.use("/users", require("../server/routes/pages/users")(express.Router()));
const server = app.listen(0, "127.0.0.1", async () => {
	try {
		const url = `http://127.0.0.1:${server.address().port}/users/user`;
		const token = (payload, options) => jwt.sign(payload, process.env.SECRET, options);
		const request = (authorization) =>
			fetch(url, { headers: authorization ? { authorization } : {} });

		for (const invalid of [
			"",
			"invalid",
			jwt.sign({ id }, "wrong-secret"),
			token({ id }, { expiresIn: -1 }),
			token({ id: "invalid" }),
			token({ id: new mongoose.Types.ObjectId().toString() }),
		]) {
			assert.strictEqual((await request(invalid)).status, 401);
		}

		for (const authorization of [token({ id }), `Bearer ${token({ id })}`]) {
			const response = await request(authorization);
			assert.strictEqual(response.status, 200);
			assert.strictEqual((await response.json()).user._id, id);
		}

		console.log("Auth user endpoint checks passed.");
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	} finally {
		server.close();
	}
});
