const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Message = require("../models/Message");

// ✅ GET all messages (admin use / archive)
router.get("/", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find().sort("timestamp");
    res.json(messages);
  } catch (err) {
    console.error("❌ Message fetch error:", err.message);
    res.status(500).json({ msg: "Failed to get messages" });
  }
});

// ✅ POST a new message
router.post("/", verifyToken, async (req, res) => {
  try {
    const { content, avatar, room } = req.body;

    const msg = new Message({
      content,
      sender: req.user.id, // ✅ secured: logged-in user
      avatar,
      room
    });

    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    console.error("❌ Message send error:", err.message);
    res.status(500).json({ msg: "Failed to send message" });
  }
});

module.exports = router;
