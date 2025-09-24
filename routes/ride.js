const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const User = require("../models/User");

// Middleware: sirf user hi access kare
function ensureAuth(req, res, next){
  if(!req.session.user || req.session.user.role !== "user"){
    return res.redirect("/login");
  }
  next();
}

// Rider dashboard with search
router.get("/dashboard", ensureAuth, async (req,res) => {
  try{
    const { pickup, drop, date } = req.query;
    const user = await User.findById(req.session.user.id);

    let drivers = [];

    if(pickup || drop || date){
      const allDrivers = await Driver.find({});

      drivers = allDrivers.filter(driver =>
        driver.availability.some(slot => {
          const matchesPickup = !pickup || slot.pickup.toLowerCase().includes(pickup.toLowerCase());
          const matchesDrop = !drop || slot.drop.toLowerCase().includes(drop.toLowerCase());
          const matchesDate = !date || new Date(slot.date).toDateString() === new Date(date).toDateString();
          return slot.status === "available" && matchesPickup && matchesDrop && matchesDate;
        })
      );
    }

    res.render("rider", { user, drivers, pickup, drop, date });
  } catch(err){
    console.error("Error loading dashboard:", err);
    res.send("Error loading dashboard");
  }
});

// Book ride
router.post("/book/:driverId/:slotIndex", ensureAuth, async (req, res) => {
  try {
    const { driverId, slotIndex } = req.params;
    const { seats } = req.body;
    const userId = req.session.user.id;

    const driver = await Driver.findById(driverId);
    if (!driver) return res.send("Driver not found");

    const slot = driver.availability[slotIndex];
    if (!slot) return res.send("Slot not found");

    const seatsInt = parseInt(seats);
    if (slot.seatsAvailable < seatsInt) return res.send("Seats not available");

    // Update slot
    slot.seatsAvailable -= seatsInt;
    if(slot.seatsAvailable <= 0) slot.status = "full";

    // Add user to bookedBy
    slot.bookedBy.push(userId);

    // Update user's ride history
    const user = await User.findById(userId);
    user.rideHistory.push({
      driver: driver._id,
      pickup: slot.pickup,
      drop: slot.drop,
      date: slot.date,
      time: slot.time,
      seatsBooked: seatsInt,
      fare: seatsInt * slot.fare,
      status: "ongoing"
    });

    await driver.save();
    await user.save();

    res.redirect("/ride/history");
  } catch(err){
    console.error("Error booking ride:", err);
    res.send("Error booking ride");
  }
});

// Rider ride history
router.get("/history", ensureAuth, async (req,res) => {
  try{
    const user = await User.findById(req.session.user.id).populate({
      path: "rideHistory.driver",
      select: "name car"
    });

    res.render("rideHistory", { user });
  } catch(err){
    console.error("Error loading ride history:", err);
    res.send("Error loading ride history");
  }
});

module.exports = router;

