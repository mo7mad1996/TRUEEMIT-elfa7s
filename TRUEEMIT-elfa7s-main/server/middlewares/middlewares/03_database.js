const mongoose = require("mongoose");

// ..:: connect to database ::..
module.exports = async function connectWithRetry() {
  mongoose.set("strictQuery", true);

  try {
    const connection = await mongoose.connect(process.env.DB_URI);
    return connection;
  } catch (err) {
    console.error("Connection failed. Retrying in 2 seconds...", err);
    setTimeout(connectWithRetry, 2000);
  }
};
