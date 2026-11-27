const { attachUser, allow } = require("../../utils/auth");
const {
	getInspectionCenter,
	updateInspectionCenter,
} = require("../../utils/inspectionCenter");

module.exports = (router) => {
	router.get("/shop", async (req, res) => {
		// Nothing is cached: every request reads the branch API, and the response
		// must not be stored by browsers or proxies either.
		res.set("Cache-Control", "no-store");
		// `branch` (SHOP_BRANCH) is the root folder of every uploaded file
		// (plugins/upload.js)
		const branch = (process.env.SHOP_BRANCH || "").trim().toLowerCase();
		return res.json({ ...(await getInspectionCenter()), branch });
	});

	router.patch("/shop", attachUser, allow("manager"), async (req, res) => {
		try {
			const shop = await updateInspectionCenter(req.body || {});
			return res.json({ shop });
		} catch (error) {
			const status = error.status || (error instanceof TypeError ? 400 : 502);
			if (status >= 500) console.error("تعذر تحديث مركز الفحص:", error);
			return res.status(status).json({ error: error.message });
		}
	});

	return router;
};
