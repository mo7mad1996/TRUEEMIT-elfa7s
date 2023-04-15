const mongoose = require("mongoose");
const Car = mongoose.model("Car");

module.exports = (router) => {
  router.get("/add_new_one", (req, res) => {
    const car = new Car();

    car.saved = false;
    car.updated = false;

    res.json(car);
  });

  router.post("/save", (req, res) => {
    const car = new Car(req.body);

    car.save().then(() => res.json(true));
  });
  router.post("/update", (req, res) => {
    Car.findByIdAndUpdate(req.body._id, req.body).then(res.json("Done"));
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

  return router;
};
