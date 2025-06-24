const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  const { content, room } = req.body;
  try {
    const newMsg = new Message({ sender: req.user.id, content, room });
    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ msg: 'Message error' });
  }
});

router.get('/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to get messages' });
  }
});

module.exports = router;
