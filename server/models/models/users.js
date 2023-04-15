const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema({
  name: String,
  user_id: { type: String, unique: true },
  password: String,
  job: String,
  lastLogin: Number,
});

mongoose.model("Users", user);
