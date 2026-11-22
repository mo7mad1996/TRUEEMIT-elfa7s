const assert = require("assert");
const test = require("node:test");
const { fetchInspectionCenter } = require("../server/utils/inspectionCenter");

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
