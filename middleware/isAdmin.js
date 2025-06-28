const isAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = isAdmin;
