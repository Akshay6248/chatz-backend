const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// ✅ Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Get current logged-in user's profile
router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// ✅ Update profile (username, gender, avatar)
router.put("/update", auth, upload.single("avatar"), async (req, res) => {
  const { username, gender } = req.body;
  const user = req.user;

  if (username) user.username = username;
  if (gender) user.gender = gender;
  if (req.file) user.avatar = req.file.path;
  await user.save();
  res.json(user);
});

// ✅ NEW: Get all users (used in ChatRoom sidebar)
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to get users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
