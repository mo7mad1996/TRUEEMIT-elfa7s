const { attachUser, allow } = require("../../utils/auth");
const {
	isStale,
	refreshInspectionCenter,
	updateInspectionCenter,
} = require("../../utils/inspectionCenter");

module.exports = (router) => {
	router.get("/shop", async (req, res) => {
		// The startup snapshot is cached in memory; re-check the branch API at
		// most once a minute so a renewed subscription (or a newly added branch)
		// takes effect without a server restart.
		if (isStale(global.inspectionCenter)) {
			try {
				await refreshInspectionCenter();
			} catch (error) {
				console.error("Unable to refresh inspection center:", error);
			}
		}

		const inspectionCenter = global.inspectionCenter || {
			shop: null,
			status: "unconfigured",
		};

		return res.json(inspectionCenter);
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
