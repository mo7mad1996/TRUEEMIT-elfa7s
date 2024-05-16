const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const car = new Schema(
  {
    date: { type: Date, default: Date.now },
    type: { type: String, default: "" },
    car_id: { type: String, default: "" },
    vin_no: { type: String, default: "" },
    service: { type: String, default: "" },
    odometer: { type: String, default: "" },
    mechanical: { type: String, default: "" },
    computer: { type: String, default: "" },
    ground: { type: String, default: "" },
    body: {
      hood: { type: Number, default: 0 },
      fender_f_r: { type: Number, default: 0 },
      door_f_r: { type: Number, default: 0 },
      door_b_r: { type: Number, default: 0 },
      fender_b_r: { type: Number, default: 0 },
      fender_f_l: { type: Number, default: 0 },
      door_f_l: { type: Number, default: 0 },
      door_b_l: { type: Number, default: 0 },
      fender_b_l: { type: Number, default: 0 },
      fish_r: { type: Number, default: 0 },
      fish_l: { type: Number, default: 0 },
      stand_r: { type: Number, default: 0 },
      stand_l: { type: Number, default: 0 },
      trunk: { type: Number, default: 0 },
      // trunk_door: { type: Number, default: 0 },
      pillar_r: { type: Number, default: 0 },
      pillar_l: { type: Number, default: 0 },
      truck_door: { type: Number, default: 0 },
      roof: { type: Number, default: 0 },
      note: { type: String, default: "" },
    },
    chassis: { type: String, default: "" },
    accessories: { type: String, default: "" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "clients" },
    representative: { type: String, default: "" },
    payment: { type: String, default: "" },
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mongoose.model("Car", car);
