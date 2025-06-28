const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");
const Message = require("../models/Message");

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
});

router.post("/block", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.blocked = !user.blocked;
  await user.save();
  res.json({ message: "Updated" });
});

router.post("/delete", verifyToken, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.body.userId);
  await Message.deleteMany({ sender: req.body.userId });
  res.json({ message: "User & messages deleted" });
});

router.post("/soft-delete", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isDeleted = true;
  await user.save();
  res.json({ message: "User soft-deleted" });
});

router.post("/ban", verifyToken, isAdmin, async (req, res) => {
  const { userId, reason } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBanned = true;
  user.banReason = reason || "";
  await user.save();
  res.json({ message: "User banned" });
});

router.post("/unban", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBanned = false;
  user.banReason = "";
  await user.save();
  res.json({ message: "User unbanned" });
});

router.post("/promote", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isAdmin = true;
  await user.save();
  res.json({ message: "User promoted" });
});

router.post("/demote", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isAdmin = false;
  await user.save();
  res.json({ message: "User demoted" });
});

router.put("/promote/:username", verifyToken, isAdmin, async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isAdmin = true;
  await user.save();
  res.json({ message: `${user.username} has been promoted to admin` });
});

module.exports = router;