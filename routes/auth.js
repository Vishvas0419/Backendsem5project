// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Driver = require("../models/Driver");

// ========================
// GET Signup Page
// ========================
router.get("/signup", (req, res) => {
  res.render("signup"); // signup.ejs render hoga
});

// ========================
// POST Signup
// ========================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, car } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    const existingDriver = await Driver.findOne({ email });
    if (existingUser || existingDriver) {
      return res.send("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "user") {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
      await newUser.save();
    } else if (role === "driver") {
      const newDriver = new Driver({
        name,
        email,
        password: hashedPassword,
        car,
      });
      await newDriver.save();
    }

    // ✅ After signup, redirect to login page
    res.redirect("/login");
  } catch (err) {
    console.error("Signup Error:", err);
    res.send("Error in signup");
  }
});

// ========================
// GET Login Page
// ========================
router.get("/login", (req, res) => {
  res.render("login"); // login.ejs render hoga
});

// ========================
// POST Login
// ========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check driver first
    let user = await Driver.findOne({ email });
    let role = "driver";

    // If not found in drivers, check users
    if (!user) {
      user = await User.findOne({ email });
      role = "user";
    }

    if (!user) return res.send("User not found");

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid password");

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      role,
    };

    // Redirect based on role
    if (role === "driver") {
      res.redirect("/driver/dashboard");
    } else {
      res.redirect("/ride/dashboard");
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.send("Error in login");
  }
});

// ========================
// Logout
// ========================
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout Error:", err);
    res.redirect("/login");
  });
});

module.exports = router;
