const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("Users");

// Generate salt
const salt = bcrypt.genSaltSync(8);

module.exports = (router) => {
  router.get("/", async (req, res) => {
    const users = await User.find().select([
      "name",
      "user_id",
      "lastLogin",
      "job",
    ]);

    res.json(users);
  });

  router.post("/add", (req, res) => {
    const password = bcrypt.hashSync(req.body.password, salt);

    const user = new User({
      ...req.body,
      password,
    });

    user
      .save()
      .then(() => res.json({ saved: true, user }))
      .catch((err) => res.status(401).json({ saved: false }));
  });

  router.post("/login", async (req, res) => {
    //  Find the user in database by userId
    const user = await User.findOne({ user_id: req.body.user_id });

    if (user) {
      // check is password ok
      const ok = await bcrypt.compare(req.body.password, user.password);

      if (ok) {
        // create a token
        const token = JWT.sign({ id: user.id }, "secret");

        // Update last login time and save it to
        await User.updateOne(user, { lastLogin: Date.now() }).then((_) =>
          res.json({ token, user })
        );
      } else res.status(401).json({ msg: "Non-Authoritative Information" });
    } else res.status(401).json({ msg: "Non-Authoritative Information" });
  });

  router.get("/user", async (req, res) => {
    // get auth token
    const token = req.headers.authorization;
    if (!token)
      return res.json({
        error: "Not Authorized",
      });

    // get id from the token
    const { id } = JWT.verify(token, "secret");

    // get user from id
    const user = await User.findById(id);
    res.json({ user });
  });

  router.post("/check_id", async (req, res) => {
    const valid = await User.findOne(req.body);

    res.json(!valid);
  });

  router.delete("/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id).then(() =>
      res.json({ deleted: true })
    );
  });

  router.post("/check_pass", async (req, res) => {
    const user = await User.findById(req.body._id);
    if (user) {
      const ok = await bcrypt.compare(req.body.password, user.password);
      res.json(ok);
    }
  });
  router.post("/update", (req, res) => {
    const new_user = { ...req.body };

    if (req.body.new_pass) {
      const password = bcrypt.hashSync(req.body.new_pass, salt);
      new_user.password = password;
    }

    User.findByIdAndUpdate(req.body._id, new_user)
      .then((user) => res.json(user))
      .catch((err) => res.status(403).json(err));
  });

  return router;
};
