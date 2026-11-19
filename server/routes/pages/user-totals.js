const mongoose = require("mongoose");

const User = mongoose.model("Users");
const roles = ["manager", "exclusive", "engineer"];

module.exports = (router) => {
	router.get("/", async (req, res) => {
		try {
			const results = await User.aggregate([
				{ $match: { job: { $in: roles } } },
				{ $group: { _id: "$job", count: { $sum: 1 } } },
			]);

			const totals = Object.fromEntries(results.map(({ _id, count }) => [_id, count]));

			return res.json({
				manager: totals.manager || 0,
				exclusive: totals.exclusive || 0,
				engineer: totals.engineer || 0,
			});
		} catch (error) {
			console.error("Error counting users by role:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	});

	return router;
};
