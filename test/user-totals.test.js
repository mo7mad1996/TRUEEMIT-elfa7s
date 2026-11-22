const assert = require("assert");
const test = require("node:test");
const mongoose = require("mongoose");

require("../server/models/models/users");
const User = mongoose.model("Users");
const createRoute = require("../server/routes/pages/user-totals");

test("user totals return counts by job, including zero counts", async () => {
	let handler;
	createRoute({ get: (path, callback) => { handler = callback; } });
	const originalAggregate = User.aggregate;
	let pipeline;
	User.aggregate = async (value) => {
		pipeline = value;
		return [{ _id: "engineer", count: 30 }, { _id: "manager", count: 10 }];
	};

	try {
		let result;
		await handler({}, { json: (body) => { result = body; } });
		assert.deepStrictEqual(result, { manager: 10, engineer: 30, exclusive: 0 });
		assert.deepStrictEqual(pipeline, [
			{ $match: { job: { $in: ["manager", "engineer", "exclusive"] } } },
			{ $group: { _id: "$job", count: { $sum: 1 } } },
		]);

		User.aggregate = async () => [];
		await handler({}, { json: (body) => { result = body; } });
		assert.deepStrictEqual(result, { manager: 0, engineer: 0, exclusive: 0 });
	} finally {
		User.aggregate = originalAggregate;
	}
});

test("user totals report database errors", async () => {
	let handler;
	createRoute({ get: (path, callback) => { handler = callback; } });
	const originalAggregate = User.aggregate;
	const originalError = console.error;
	User.aggregate = async () => { throw new Error("database unavailable"); };
	console.error = () => {};

	try {
		let status;
		let result;
		await handler({}, {
			status: (code) => {
				status = code;
				return { json: (body) => { result = body; } };
			},
		});
		assert.strictEqual(status, 500);
		assert.deepStrictEqual(result, { error: "Internal server error" });
	} finally {
		User.aggregate = originalAggregate;
		console.error = originalError;
	}
});
