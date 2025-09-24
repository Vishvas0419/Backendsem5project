const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const User = require("../models/User");
const Ride = require("../models/Ride");

function ensureAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== "driver") return res.redirect("/login");
  next();
}

// Driver Dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  const driver = await Driver.findById(req.session.user.id).populate({ path: "availability.bookedBy", select: "name" });
  res.render("driver", { driver });
});

// Add Availability
router.post("/addAvailability", ensureAuth, async (req, res) => {
  const { pickup, drop, date, time, fare, seatsAvailable } = req.body;
  const driver = await Driver.findById(req.session.user.id);
  const existingSlot = driver.availability.find(
    (slot) =>
      slot.pickup === pickup &&
      slot.drop === drop &&
      new Date(slot.date).toDateString() === new Date(date).toDateString() &&
      slot.time === time
  );

  if (existingSlot) existingSlot.seatsAvailable += parseInt(seatsAvailable);
  else driver.availability.push({ pickup, drop, date, time, fare, seatsAvailable, status: "available" });

  await driver.save();
  res.redirect("/driver/dashboard");
});

module.exports = router;
