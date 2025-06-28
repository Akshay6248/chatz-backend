// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config(); // ✅ Ensure this is loaded for accessing environment variables

module.exports = async (req, res, next) => {
  // Step 1: Check for Authorization header with Bearer token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    // Step 2: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // No fallback, use real secret

    // Step 3: Ensure token payload has user id
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Step 4: Find user by ID (no password included)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // Step 5: Attach user data to request object for further use
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
