const mongoose = require("mongoose");

const filteredWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
});

module.exports = mongoose.model("FilteredWord", filteredWordSchema);
