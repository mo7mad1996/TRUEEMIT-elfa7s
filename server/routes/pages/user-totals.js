const mongoose = require("mongoose");

const User = mongoose.model("Users");

module.exports = (router) => {
	router.get("/", async (req, res) => {
		try {
			const counts = await User.aggregate([
				{ $match: { job: { $in: ["manager", "engineer", "exclusive"] } } },
				{ $group: { _id: "$job", count: { $sum: 1 } } },
			]);
			const totals = { manager: 0, engineer: 0, exclusive: 0 };
			for (const { _id, count } of counts) totals[_id] = count;
			return res.json(totals);
		} catch (error) {
			console.error("Error counting users:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	});

	return router;
};
