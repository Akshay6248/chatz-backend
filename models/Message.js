const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  sender:    { type: String, required: true },
  avatar:    { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
