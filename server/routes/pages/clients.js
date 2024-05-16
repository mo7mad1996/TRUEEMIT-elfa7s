const mongoose = require("mongoose");

const Clients = mongoose.model("clients");
const Car = mongoose.model("Car");

module.exports = (router) => {
  router.get("/", async (req, res) => {
    const users = await Clients.find();

    res.json(users);
  });

  router.post("/add", (req, res) => {
    const client = new Clients(req.body);

    client
      .save()
      .then(() => res.json({ saved: true, client }))
      .catch((err) => res.status(401).json({ saved: false }));
  });

  router.get("/:id/cars", (req, res) => {
    Car.find({ client: req.params.id }).then((d) => res.json(d));
  });

  router.get("/:id", (req, res) =>
    Clients.findById(req.params.id).then((d) => res.json(d))
  );
  router.post("/:id/addpay", (req, res) => {
    Clients.findByIdAndUpdate(
      req.params.id,
      { $push: { pay: req.body } },
      { new: true }
    ).then((d) => res.json(d));
  });

  return router;
};
