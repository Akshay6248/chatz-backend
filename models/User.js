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
  rank:       { type: String },
  actions:    { type: Array, default: [] },
  createdAt:  { type: Date, default: Date.now },
  lastSeen:   { type: Date, default: Date.now },

  // ✅ New Additions (for admin power)
  ipAddress:  { type: String },             // For IP-based tracking or banning
  banReason:  { type: String },             // Reason for ban (optional, for admin UI)
  isDeleted:  { type: Boolean, default: false }  // Soft delete feature
});

module.exports = mongoose.model("User", UserSchema);
