const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const ChatRoom = require("../models/ChatRoom");

// Create a new chatroom
router.post("/", verifyToken, async (req, res) => {
  const { name } = req.body;
  try {
    const existing = await ChatRoom.findOne({ name });
    if (existing) return res.status(400).json({ message: "Room already exists" });

    const newRoom = await ChatRoom.create({ name });
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ message: "Failed to create room" });
  }
});

// Get all chatrooms
router.get("/", verifyToken, async (req, res) => {
  try {
    const rooms = await ChatRoom.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// Delete a room (admin only - optionally restrict this)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await ChatRoom.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;