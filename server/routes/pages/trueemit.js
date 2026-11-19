module.exports = (router) => {
	router.get("/shop", (req, res) => {
		const inspectionCenter = global.inspectionCenter || {
			shop: null,
			status: "unconfigured",
		};

		return res.json(inspectionCenter);
	});

	return router;
};
