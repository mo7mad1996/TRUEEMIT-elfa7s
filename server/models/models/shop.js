const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Shop = new Schema({
  name: String,
  expired: Number,
  logo: String,
  phone: String,
  password: String,
  types: [{ type: String }],
});

mongoose.model("Shop", Shop);
