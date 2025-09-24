const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  pickup: String,
  drop: String,
  date: Date,
  time: String,
  fare: Number,
  seatsAvailable: Number,
  status: { type: String, enum: ["available", "full"], default: "available" },
  bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const driverSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  car: String,
  availability: [availabilitySchema],
  rides: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ride" }]
});

module.exports = mongoose.model("Driver", driverSchema);
