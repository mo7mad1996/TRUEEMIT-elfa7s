const assert = require("assert");
const test = require("node:test");
const {
	fetchInspectionCenter,
	getInspectionCenter,
} = require("../server/utils/inspectionCenter");

test("inspection-center expiration timestamp determines readiness", async () => {
	const originalNow = Date.now;
	Date.now = () => 2000;

	try {
		for (const [expired, expectedStatus] of [
			[1999, "expired"],
			[2000, "expired"],
			[2001, "ready"],
		]) {
			const expiryDate = "2026-11-20";
			const result = await fetchInspectionCenter("test-branch", async () => ({
				ok: true,
				status: 200,
				json: async () => ({
					item: { _id: "center-id", name: "Test Center", expired, expiryDate },
				}),
			}));

			assert.strictEqual(result.status, expectedStatus);
			assert.strictEqual(result.shop.expired, expired);
			assert.strictEqual(result.shop.expiryDate, expiryDate);
		}
	} finally {
		Date.now = originalNow;
	}
});

test("every read of the inspection center goes to the branch API", async () => {
	process.env.SHOP_BRANCH = "test-branch";

	try {
		const responses = [Date.now() + 86400000, Date.now() - 1000];
		const fetchImpl = async () => ({
			ok: true,
			status: 200,
			json: async () => ({
				item: { _id: "center-id", name: "Test Center", expired: responses.shift() },
			}),
		});

		const renewed = await getInspectionCenter(fetchImpl);
		assert.strictEqual(renewed.status, "ready");

		const expired = await getInspectionCenter(fetchImpl);
		assert.strictEqual(expired.status, "expired");
	} finally {
		delete process.env.SHOP_BRANCH;
	}
});
