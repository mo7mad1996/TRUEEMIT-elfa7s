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
		return res.json(await getInspectionCenter());
	});

	router.patch("/shop", attachUser, allow("manager"), async (req, res) => {
		try {
			const shop = await updateInspectionCenter(req.body || {});
			return res.json({ shop });
		} catch (error) {
			const status = error.status || (error instanceof TypeError ? 400 : 502);
			if (status >= 500) console.error("Unable to update inspection center:", error);
			return res.status(status).json({ error: error.message });
		}
	});

	return router;
};
