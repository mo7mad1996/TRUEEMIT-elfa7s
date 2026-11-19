const mongoose = require("mongoose");

const Car = mongoose.model("Car");
const ExclusiveCar = mongoose.model("Car-exclusive");

function parseDate(value, endOfDay = false) {
	if (value == null || value === "") return null;

	const rawValue = String(value).trim();
	if (!rawValue) return null;

	const timestamp = Number(rawValue);
	const date =
		Number.isFinite(timestamp) && rawValue !== ""
			? new Date(timestamp)
			: new Date(rawValue);

	if (Number.isNaN(date.getTime())) return undefined;

	if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
		date.setUTCHours(23, 59, 59, 999);
	}

	return date;
}

module.exports = (router) => {
	router.get("/", async (req, res) => {
		const startDate = parseDate(req.query.startdate);
		const endDate = parseDate(req.query.enddate, true);

		if (startDate === undefined || endDate === undefined) {
			return res.status(400).json({ error: "Invalid startdate or enddate" });
		}

		if (startDate && endDate && startDate > endDate) {
			return res.status(400).json({ error: "startdate must be before enddate" });
		}

		const dateFilter = {};
		if (startDate) dateFilter.$gte = startDate;
		if (endDate) dateFilter.$lte = endDate;

		const filter = Object.keys(dateFilter).length ? { date: dateFilter } : {};

		try {
			const [cars, exclusiveCars] = await Promise.all([
				Car.countDocuments(filter),
				ExclusiveCar.countDocuments(filter),
			]);

			return res.json({
				cars,
				"car-exclusive": exclusiveCars,
				total: cars + exclusiveCars,
			});
		} catch (error) {
			console.error("Error counting cars:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	});

	return router;
};
