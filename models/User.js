// User schema
const mongoose = require("mongoose");

const rideHistorySchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  pickup: String,
  drop: String,
  date: Date,
  time: String,
  seatsBooked: Number,
  fare: Number,
  status: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  rideHistory: [rideHistorySchema]
});

module.exports = mongoose.model("User", userSchema);
