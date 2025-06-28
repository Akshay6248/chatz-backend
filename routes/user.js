// routes/user.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

router.get("/me", verifyToken, (req, res) => {
  const { _id, username, email, isAdmin } = req.user;
  res.json({ id: _id, username, email, isAdmin });
}); 

// ✅ Get all users (protected route)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // all users, password exclude
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get current user
router.get("/me", verifyToken, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    isAdmin: req.user.isAdmin
  });
});

module.exports = router;
