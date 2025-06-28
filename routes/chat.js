const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const verifyToken = require('../middleware/verifyToken');

// ✅ POST a new message
router.post('/', verifyToken, async (req, res) => {
  const { content, room } = req.body;

  try {
    const newMsg = new Message({
      sender: req.user.id,
      content,
      room
    });

    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (err) {
    console.error("❌ Message creation error:", err.message);
    res.status(500).json({ msg: 'Message error' });
  }
});

// ✅ GET all messages for a room
router.get('/:room', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Message fetch error:", err.message);
    res.status(500).json({ msg: 'Failed to get messages' });
  }
});

module.exports = router;
