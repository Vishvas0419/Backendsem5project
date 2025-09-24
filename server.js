const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Routes
app.use("/", require("./routes/auth"));
app.use("/driver", require("./routes/driver"));
app.use("/ride", require("./routes/ride"));

// Home
app.get("/", (req, res) => res.redirect("/login"));

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
