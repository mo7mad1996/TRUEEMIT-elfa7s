const mongoose = require("mongoose");
const Car = mongoose.model("Car");
const Clients = mongoose.model("clients");

module.exports = (router) => {
	router.get("/add_new_one", (req, res) => {
		const car = new Car(),
			newcar = new Object({ ...car._doc, saved: false, updated: false });

		res.json(newcar);
	});

	router.post("/save", async (req, res) => {
		const car = new Car(req.body);

		car.save().then(() => res.json(true));
	});
	router.post("/update", (req, res) => {
		const client = req.body.client || null;
		Car.findByIdAndUpdate(req.body._id, { ...req.body, client }).then(res.json("Done"));
	});

	router.delete("/delete", async (req, res) => {
		const { date } = req.query;
		const parsedDate = new Date(date);

		if (isNaN(parsedDate)) {
			return res.status(400).json({ error: "Invalid date format" });
		}

		const result = await Car.deleteMany({ date: { $lt: parsedDate } });

		return res.json(result);
	});

	router.get("/:id", async (req, res) => {
		const car = await Car.findById(req.params.id);
		res.json(car);
	});
	router.delete("/:id", async (req, res) => {
		const car = await Car.findByIdAndDelete(req.params.id);
		res.json(car);
	});

	router.get("/", async (req, res) => {
		const cars = await Car.find().sort({ _id: -1 });

		res.json(cars);
	});

	router.get("/last/:days", async (req, res) => {
		var d = new Date();
		d.setDate(d.getDate() - +req.params.days);

		if (+req.params.days == 1) d = d.setHours(24, 0, 0, 0);

		const cars = await Car.find({ date: { $gt: d } }).select([
			"cost",
			"payment",
			"date",
			"createdAt",
		]);

		res.json(cars);
	});

	router.get("/special/:start/:end", async (req, res) => {
		const { start, end } = req.params;

		// Validate the timestamps
		const startTimestamp = Number(start);
		const endTimestamp = Number(end);

		if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
			return res.status(400).json({
				error: "Invalid date format. Please provide valid timestamps.",
			});
		}

		try {
			// Find cars within the date range
			const cars = await Car.find({
				date: { $gte: startTimestamp, $lte: endTimestamp },
			}).select(["cost", "payment", "date", "createdAt"]);

			// Send the result as JSON
			res.json(cars);
		} catch (error) {
			// Handle errors
			console.error("Error fetching cars:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	return router;
};
