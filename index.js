const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const User = require("./models/User.js");
const authMiddleware = require("./middleware/auth.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// Route to Serve HTML Files
// =======================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/auth/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/auth/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/auth/forgot-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'forgot.html')));
app.get('/reset-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reset-password.html')));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/dashboard/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/dashboard/predictions', (req, res) => res.sendFile(path.join(__dirname, 'public', 'predictions.html')));
app.get('/dashboard/matches', (req, res) => res.sendFile(path.join(__dirname, 'public', 'matches.html')));

// =========================
// User Registration (Auto Verify)
// =========================
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
app
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      isVerified: true,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered and verified successfully" });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// User Login
// =========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: user.balance,
        role: user.role,
        isVerified: user.isVerified, // ✅ included
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login error" });
  }
});

// =========================
// Protected Dashboard
// =========================
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Dashboard error" });
  }
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
