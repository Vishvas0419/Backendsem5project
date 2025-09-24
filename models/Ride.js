const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seatsBooked: Number,
  fare: Number,
  pickup: String,
  drop: String,
  date: Date,
  time: String,
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" }
});

module.exports = mongoose.model("Ride", rideSchema);
