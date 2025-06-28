// middleware/isAdmin.js
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // verify from DB

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
