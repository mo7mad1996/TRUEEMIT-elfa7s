const assert = require("assert");
const test = require("node:test");
const mongoose = require("mongoose");

require("../server/models/models/car");
require("../server/models/models/car-exclusive");
const Car = mongoose.model("Car");
const ExclusiveCar = mongoose.model("Car-exclusive");
const createRoute = require("../server/routes/pages/car-totals");

function captureHandler() {
	let handler;
	createRoute({ get: (path, callback) => { handler = callback; } });
	return handler;
}

function stubCounts() {
	const filters = [];
	const originalCar = Car.countDocuments;
	const originalExclusive = ExclusiveCar.countDocuments;
	Car.countDocuments = async (filter) => {
		filters.push(filter);
		return 3;
	};
	ExclusiveCar.countDocuments = async () => 2;
	return { filters, restore: () => { Car.countDocuments = originalCar; ExclusiveCar.countDocuments = originalExclusive; } };
}

function invoke(handler, query) {
	return new Promise((resolve, reject) => {
		const res = {
			status: (code) => ({
				json: (body) => resolve({ status: code, body }),
			}),
			json: (body) => resolve({ status: 200, body }),
		};
		handler({ query }, res).catch(reject);
	});
}

test("car totals accept an optional start/end date filter", async () => {
	const handler = captureHandler();
	const { filters, restore } = stubCounts();
	try {
		const result = await invoke(handler, { start: "2026-01-01", end: "2026-01-31" });
		assert.strictEqual(result.status, 200);
		assert.deepStrictEqual(result.body, { cars: 3, "car-exclusive": 2, total: 5 });
		assert.deepStrictEqual(filters[0], {
			date: {
				$gte: new Date("2026-01-01T00:00:00.000Z"),
				$lte: new Date("2026-01-31T23:59:59.999Z"),
			},
		});

		const unfiltered = await invoke(handler, {});
		assert.strictEqual(unfiltered.status, 200);
		assert.deepStrictEqual(filters[1], {});
	} finally {
		restore();
	}
});

test("car totals keep startdate/enddate and reject invalid or inverted ranges", async () => {
	const handler = captureHandler();
	const { filters, restore } = stubCounts();
	try {
		const legacy = await invoke(handler, { startdate: "2026-02-01", enddate: "2026-02-10" });
		assert.strictEqual(legacy.status, 200);
		assert.deepStrictEqual(filters[0], {
			date: {
				$gte: new Date("2026-02-01T00:00:00.000Z"),
				$lte: new Date("2026-02-10T23:59:59.999Z"),
			},
		});

		const invalid = await invoke(handler, { start: "not-a-date" });
		assert.strictEqual(invalid.status, 400);

		const inverted = await invoke(handler, { start: "2026-02-10", end: "2026-02-01" });
		assert.strictEqual(inverted.status, 400);
	} finally {
		restore();
	}
});
