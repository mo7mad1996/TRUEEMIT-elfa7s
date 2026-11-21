const assert = require("assert");
const test = require("node:test");
const {
	fetchInspectionCenter,
	isStale,
	refreshInspectionCenter,
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

test("refreshing the inspection center picks up a renewed subscription", async () => {
	process.env.SHOP_BRANCH = "test-branch";
	const originalCenter = global.inspectionCenter;

	try {
		global.inspectionCenter = {
			shop: { _id: "center-id", name: "Test Center" },
			status: "expired",
			fetchedAt: Date.now() - 120 * 1000,
		};
		assert.ok(isStale(global.inspectionCenter));

		const renewed = await refreshInspectionCenter(async () => ({
			ok: true,
			status: 200,
			json: async () => ({
				item: { _id: "center-id", name: "Test Center", expired: Date.now() + 86400000 },
			}),
		}));
		assert.strictEqual(renewed.status, "ready");
		assert.strictEqual(global.inspectionCenter.status, "ready");

		// A transient API failure must not flip a working site to "unavailable".
		const kept = await refreshInspectionCenter(async () => {
			throw new Error("network down");
		});
		assert.strictEqual(kept.status, "ready");
	} finally {
		global.inspectionCenter = originalCenter;
		delete process.env.SHOP_BRANCH;
	}
});
