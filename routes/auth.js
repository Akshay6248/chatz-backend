const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(400).json({ message: "Email or username in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, username, password: hash });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.status(201).json({ token, user: { id: user._id, email, username, isAdmin: user.isAdmin } });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email/Username and password required" });

  const user = await User.findOne({ $or: [{ email }, { username: email }] });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin } });
});

module.exports = router;
