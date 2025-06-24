const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

// Get all users
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch {
    res.status(500).json({ message: "Fetch users failed" });
  }
});

// Promote/demote admin
router.put('/admin-toggle/:id', auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json({ message: "Admin status updated", user });
});

// Delete user
router.delete('/delete-user/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// Assign rank
router.put('/rank/:id', auth, adminOnly, async (req, res) => {
  const { rank } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { rank }, { new: true });
  res.json(user);
});

// Moderate actions (ban, mute, warn)
router.put('/moderate/:id', auth, adminOnly, async (req, res) => {
  const { action } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.actions = user.actions || [];
  user.actions.push({ type: action, at: new Date() });

  if (action === 'ban') user.isBanned = true;
  if (action === 'unban') user.isBanned = false;

  await user.save();
  res.json({ message: `${action} completed`, user });
});

// Manage chatrooms (in-memory for now)
let chatrooms = [];

router.get('/chatrooms', auth, adminOnly, (req, res) => {
  res.json(chatrooms);
});

router.post('/chatrooms', auth, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Chatroom name required" });
  chatrooms.push({ name });
  res.status(201).json(chatrooms);
});

router.delete('/chatrooms/:name', auth, adminOnly, (req, res) => {
  chatrooms = chatrooms.filter(r => r.name !== req.params.name);
  res.json(chatrooms);
});

// Manage filtered words (in-memory for now)
let filteredWords = [];

router.get('/filtered-words', auth, adminOnly, (req, res) => {
  res.json(filteredWords);
});

router.post('/filtered-words', auth, adminOnly, (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ message: "Word required" });
  filteredWords.push(word);
  res.status(201).json(filteredWords);
});

router.delete('/filtered-words/:word', auth, adminOnly, (req, res) => {
  filteredWords = filteredWords.filter(w => w !== req.params.word);
  res.json(filteredWords);
});

module.exports = router;
