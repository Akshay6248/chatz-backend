const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  gender:     { type: String },
  avatar:     { type: String },
  isAdmin:    { type: Boolean, default: false },
  isOnline:   { type: Boolean, default: false },
  isBanned:   { type: Boolean, default: false },
  isMuted:    { type: Boolean, default: false },       // ✅ for mute
  isGhosted:  { type: Boolean, default: false },       // ✅ for ghost
  socketId:   { type: String, default: "" },           // ✅ for real-time targeting
  rank:       { type: String },
  actions:    { type: Array, default: [] },
  createdAt:  { type: Date, default: Date.now },
  lastSeen:   { type: Date, default: Date.now },
  ipAddress:  { type: String },
  banReason:  { type: String },
  isDeleted:  { type: Boolean, default: false }
});

module.exports = mongoose.model("User", UserSchema);
