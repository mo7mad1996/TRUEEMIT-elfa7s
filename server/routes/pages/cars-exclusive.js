const mongoose = require("mongoose");
const formidable = require("formidable");
const Car = mongoose.model("Car-exclusive");
const User = mongoose.model("Users");
const fs = require("fs");
const path = require("path");

const { attachUser, allow } = require("../../utils/auth");

const uploadDir = path.join(__dirname, "../..", "upload");

// the id used for the legacy cars that were created before cars got an owner
const NO_OWNER = "none";

// methods
/**
 * // to create a new dir-path
 * @param {string} dirName
 * @param {function} cb callback
 *
 * @invoke {cb}  CallBack function
 */
function createDir(dir, cb = () => {}) {
	const dir_path = path.join(uploadDir, dir);
	fs.mkdir(dir_path, { recursive: true }, cb);
}

/**
 * Append a new image in  path from
 * @inputs {path?: string, file}
 *
 * @return res json with a full image path
 */
function append_image(req, res) {
	const form = formidable({
		uploadDir: uploadDir,
		keepExtensions: true,
	});

	form.parse(req, (err, fields, files) => {
		const currant_path = files.file.newFilename;
		const target_Path = path.posix.join(fields.path || "", files.file?.newFilename);

		createDir(fields.path || "", () =>
			fs.rename(path.join(uploadDir, currant_path), path.join(uploadDir, target_Path), () =>
				res.json({ file: "/" + target_Path }),
			),
		);
	});
}

/**
 * remove file from
 *
 * @inputs req.body {fileName: string}
 *
 * @returns json { success?: Boolean } OR {error: string}
 *
 */
function removeFile(req, res) {
	const { fileName } = req.body;

	const filePath = path.join(uploadDir, fileName.toString());

	fs.unlink(filePath, (err) => {
		if (err) {
			console.error("Failed to delete file:", err);
			return res.status(500).json({ error: "Failed to delete file" });
		}
		res.json({ success: true });
	});
}

/**
 * Build the mongo filter that limits a query to the cars the requester owns.
 *
 * An exclusive user is always locked to his own cars. The manager sees every
 * car, and may narrow down to one owner with `?user=<id>` (or `?user=none`
 * for the legacy cars that have no owner).
 *
 * @param {object} req express request (needs `req.auth_user`)
 * @param {object} extra additional filter properties
 */
function scope(req, extra = {}) {
	const filter = { ...extra };

	if (req.auth_user.job != "manager") filter.user = req.auth_user._id;
	else if (req.query.user) filter.user = req.query.user == NO_OWNER ? null : req.query.user;

	return filter;
}

// routes
module.exports = (router) => {
	// every route below needs to know who is asking
	router.use(attachUser);

	router.get("/add_new_one", allow("exclusive"), (req, res) => {
		const car = new Car({ user: req.auth_user._id });
		const newCar = new Object({ ...car._doc, saved: false, updated: false });

		res.json(newCar);
	});

	router.post("/append_image", allow("exclusive", "manager"), append_image);
	router.post("/remove_image", allow("exclusive", "manager"), removeFile);

	router.post("/save", allow("exclusive"), async (req, res) => {
		// the owner always comes from the token, never from the request body
		const car = new Car({ ...req.body, user: req.auth_user._id });

		car.save().then(() => res.json(true));
	});

	router.post("/update", allow("exclusive", "manager"), async (req, res) => {
		const client = req.body.client || null;

		// the owner can never be changed through an update — drop it from the body
		const { user, ...body } = req.body;

		const car = await Car.findOneAndUpdate(scope(req, { _id: req.body._id }), { ...body, client });

		if (!car) return res.status(404).json({ error: "Car not found" });
		res.json("Done");
	});

	/**
	 * Manager only — every exclusive user with how many cars he saved.
	 */
	router.get("/owners", allow("manager"), async (req, res) => {
		const users = await User.find({ job: "exclusive" })
			.select(["name", "user_id", "lastLogin"])
			.lean();

		const totals = await Car.aggregate([
			{ $group: { _id: "$user", cars: { $sum: 1 }, last_car: { $max: "$date" } } },
		]);

		const byUser = new Map(totals.map((t) => [String(t._id), t]));

		const owners = users.map((user) => ({
			...user,
			cars: byUser.get(String(user._id))?.cars || 0,
			last_car: byUser.get(String(user._id))?.last_car || null,
		}));

		// legacy cars saved before cars had an owner — visible to the manager only
		const orphans = byUser.get("null");
		if (orphans?.cars)
			owners.push({
				_id: NO_OWNER,
				name: "سيارات غير مسنده (قبل التحديث)",
				user_id: "-",
				lastLogin: null,
				cars: orphans.cars,
				last_car: orphans.last_car,
			});

		res.json(owners);
	});

	router.delete("/delete", allow("manager"), async (req, res) => {
		const { date } = req.query;
		const parsedDate = new Date(date);

		if (isNaN(parsedDate)) {
			return res.status(400).json({ error: "Invalid date format" });
		}

		const result = await Car.deleteMany(scope(req, { date: { $lt: parsedDate } }));

		return res.json(result);
	});

	router.get("/:id", allow("exclusive", "manager"), async (req, res) => {
		// the owner is needed to print the report with the right company logo
		const car = await Car.findOne(scope(req, { _id: req.params.id })).populate(
			"user",
			"name logo sections",
		);

		if (!car) return res.status(404).json({ error: "Car not found" });
		res.json(car);
	});

	router.delete("/:id", allow("exclusive", "manager"), async (req, res) => {
		const car = await Car.findOneAndDelete(scope(req, { _id: req.params.id }));

		if (!car) return res.status(404).json({ error: "Car not found" });
		res.json(car);
	});

	router.get("/", allow("exclusive", "manager"), async (req, res) => {
		const cars = await Car.find(scope(req)).sort({ _id: -1 });

		res.json(cars);
	});

	router.get("/last/:days", allow("exclusive", "manager"), async (req, res) => {
		var d = new Date();
		d.setDate(d.getDate() - +req.params.days);

		if (+req.params.days == 1) d = d.setHours(24, 0, 0, 0);

		const cars = await Car.find(scope(req, { date: { $gt: d } })).select([
			"cost",
			"payment",
			"date",
			"user",
			"createdAt",
		]);

		res.json(cars);
	});

	router.get("/special/:start/:end", allow("exclusive", "manager"), async (req, res) => {
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
			const cars = await Car.find(
				scope(req, { date: { $gte: startTimestamp, $lte: endTimestamp } }),
			).select(["cost", "payment", "date", "user", "createdAt"]);

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
