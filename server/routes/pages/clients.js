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

  router.get("/pays/:days", async (req, res) => {
    var d = new Date();
    d.setDate(d.getDate() - +req.params.days);

    if (+req.params.days == 1) d = d.setHours(24, 0, 0, 0);

    const clients = await Clients.find({
      "pay.createdAt": { $gte: d },
    }).select(["pay"]);

    const filteredClients = clients.map((client) => {
      const filteredPay = client.pay.filter(
        (payment) => payment.createdAt >= d
      );
      return filteredPay;
    });

    res.json(filteredClients.reduce((a, b) => a.concat(b), []));
  });

  router.get("/custom_pays/:start/:end", async (req, res) => {
    const { start, end } = req.params;

    // Convert start and end from timestamps to Date objects
    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));

    // Validate date conversion
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Invalid timestamp format" });
    }

    // Find clients within the date range
    const data = await Clients.find({
      "pay.createdAt": { $gte: startDate, $lte: endDate },
    }).select(["pay"]);

    const filteredClients = data.map((client) => {
      const filteredPay = client.pay.filter(
        (payment) =>
          new Date(payment.createdAt) >= startDate &&
          new Date(payment.createdAt) <= endDate
      );
      return filteredPay;
    });

    res.json(filteredClients.reduce((a, b) => a.concat(b), []));
  });

  router.post("/update", async (req, res) => {
    await Clients.findByIdAndUpdate(req.body.client._id, {
      pay: req.body.client.pay.map((e) => ({ ...e, is_payed: true })),
    });

    await Car.updateMany(
      { _id: { $in: req.body.carsIds } },
      { is_payed: true }
    );

    res.json({ ok: true });
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
