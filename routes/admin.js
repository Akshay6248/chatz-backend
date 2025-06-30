const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { getIO } = require("../socket"); // 👈 import socket instance
const User = require("../models/User");
const Message = require("../models/Message");

// ✅ Kick user (force logout)
router.post("/kick/:id", verifyToken, verifyAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user?.socketId) {
    const io = getIO();
    io.to(user.socketId).emit("kicked", { reason: "Admin kicked you" });
  }
  res.json({ message: "User kicked" });
});

// ✅ Mute user (prevent sending)
router.post("/mute/:id", verifyToken, verifyAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isMuted: true });

  if (user?.socketId) {
    const io = getIO();
    io.to(user.socketId).emit("muted", { duration: 300 }); // 5 mins
  }

  // Auto unmute after 5 mins
  setTimeout(async () => {
    await User.findByIdAndUpdate(req.params.id, { isMuted: false });
  }, 300000); // 300 sec = 5 min

  res.json({ message: "User muted for 5 minutes." });
});

// ✅ Ghost user (messages visible only to ghost/admin/self)
router.post("/ghost/:id", verifyToken, verifyAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isGhosted: true });
  res.json({ message: "User ghosted" });
});

module.exports = router;
