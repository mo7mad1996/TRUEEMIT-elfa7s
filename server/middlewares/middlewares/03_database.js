const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
// ..:: connect to database ::..
mongoose.connect(process.env.DB_URI).catch((err) => {
  throw err;
});

// ..:: database modles ::..

module.exports = () => {};
