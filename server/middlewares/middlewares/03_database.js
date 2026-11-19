const mongoose = require("mongoose");

// ..:: connect to database ::..
module.exports = async function connectWithRetry() {
  mongoose.set("strictQuery", true);

  if (!process.env.DB_URI) {
    throw new Error("DB_URI is required");
  }

  while (mongoose.connection.readyState !== 1) {
    try {
      return await mongoose.connect(process.env.DB_URI);
    } catch (err) {
      console.error("Connection failed. Retrying in 2 seconds...", err);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return mongoose.connection;
};
