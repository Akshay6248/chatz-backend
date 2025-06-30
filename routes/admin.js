const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const User = require("../models/User");
const Message = require("../models/Message");

let filterWords = []; // In-memory (optional: store in DB if needed)

// 🔹 Kick User
router.post("/kick/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // You can disconnect user via socket server
    user.isOnline = false;
    await user.save();

    res.json({ message: `Kicked ${user.username}` });
  } catch (err) {
    res.status(500).json({ message: "Kick failed" });
  }
});

// 🔹 Mute User
router.post("/mute/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { actions: "muted" } },
      { new: true }
    );
    res.json({ message: `Muted ${user.username}` });
  } catch (err) {
    res.status(500).json({ message: "Mute failed" });
  }
});

// 🔹 Ghost User
router.post("/ghost/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { actions: "ghosted" } },
      { new: true }
    );
    res.json({ message: `Ghosted ${user.username}` });
  } catch (err) {
    res.status(500).json({ message: "Ghosting failed" });
  }
});

// 🔹 Filter: List words
router.get("/filters", verifyToken, verifyAdmin, (req, res) => {
  res.json(filterWords);
});

// 🔹 Filter: Add word
router.post("/filters", verifyToken, verifyAdmin, (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string")
    return res.status(400).json({ message: "Invalid word" });

  if (!filterWords.includes(word)) {
    filterWords.push(word);
    res.json({ message: "Filter word added" });
  } else {
    res.status(400).json({ message: "Word already exists" });
  }
});

// 🔹 Filter: Delete word
router.delete("/filters/:word", verifyToken, verifyAdmin, (req, res) => {
  const { word } = req.params;
  filterWords = filterWords.filter((w) => w !== word);
  res.json({ message: "Filter word removed" });
});

// 🔹 /clear → Delete all messages from main room
router.delete("/clear", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Message.deleteMany({ room: "main" }); // default main room
    res.json({ message: "All messages in main room cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear messages" });
  }
});

module.exports = router;
