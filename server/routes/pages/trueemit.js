const { attachUser, allow } = require("../../utils/auth");
const { updateInspectionCenter } = require("../../utils/inspectionCenter");

module.exports = (router) => {
	router.get("/shop", (req, res) => {
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
