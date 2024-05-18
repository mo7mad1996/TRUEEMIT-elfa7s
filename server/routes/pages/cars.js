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
    Car.findByIdAndUpdate(req.body._id, { ...req.body, client }).then(
      res.json("Done")
    );
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

  return router;
};
