const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");

// Get all messages
router.get("/", auth, async (req, res) => {
  const messages = await Message.find().sort("timestamp");
  res.json(messages);
});

// Send a new message
router.post("/", auth, async (req, res) => {
  const { text, sender, avatar, timestamp } = req.body;
  const msg = new Message({ text, sender, avatar, timestamp });
  await msg.save();
  res.status(201).json(msg);
});

module.exports = router;
