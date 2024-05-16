const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const client = new Schema(
  {
    name: String,
    start: { type: Number, default: 0 },
    pay: [
      {
        value: Number,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timeseries: true,
  }
);

mongoose.model("clients", client);
