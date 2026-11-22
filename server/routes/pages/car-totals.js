const mongoose = require("mongoose");

const Car = mongoose.model("Car");
const ExclusiveCar = mongoose.model("Car-exclusive");

function parseDate(value, endOfDay) {
  if (value === undefined) return null;
  if (typeof value !== "string" || !value.trim()) return undefined;

  const input = value.trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(input);
  const date = new Date(/^-?\d+$/.test(input) ? Number(input) : input);
  if (Number.isNaN(date.getTime())) return undefined;
  if (dateOnly && date.toISOString().slice(0, 10) !== input) return undefined;
  if (dateOnly && endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
}

module.exports = (router) => {
  router.get("/", async (req, res) => {
    // Optional date range on `date`. `start`/`end` match the car-list
    // endpoints; `startDate`/`endDate` stay accepted for older clients.
    const startInput = req.query.start ?? req.query.startDate;
    const endInput = req.query.end ?? req.query.endDate;
    const start = parseDate(startInput, false);
    const end = parseDate(endInput, true);

    if (start === undefined || end === undefined) {
      return res
        .status(400)
        .json({ error: "تاريخ البداية أو النهاية غير صالح" });
    }
    if (start && end && start > end) {
      return res
        .status(400)
        .json({ error: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية" });
    }

    const range = {};
    if (start) range.$gte = start;
    if (end) range.$lte = end;
    const filter = start || end ? { date: range } : {};

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
