const mongoose = require("mongoose");
const formidable = require("formidable");
const Car = mongoose.model("Car-exclusive");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../..", "upload");

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
    const target_Path = path.posix.join(
      fields.path || "",
      files.file?.newFilename
    );

    createDir(fields.path || "", () =>
      fs.rename(
        path.join(uploadDir, currant_path),
        path.join(uploadDir, target_Path),
        () => res.json({ file: "/" + target_Path })
      )
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

// routes
module.exports = (router) => {
  router.get("/add_new_one", (req, res) => {
    const car = new Car();
    const newCar = new Object({ ...car._doc, saved: false, updated: false });

    res.json(newCar);
  });

  router.post("/append_image", append_image);
  router.post("/remove_image", removeFile);

  router.post("/save", async (req, res) => {
    const car = new Car(req.body);

    car.save().then(() => res.json(true));
  });
  router.post("/update", (req, res) => {
    const client = req.body.client || null;
    Car.findByIdAndUpdate(req.body._id, { ...req.body, client }).then(
      res.json("Done")
    );
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
