const User = require("../models/User");

const getAll = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: "guide" }).select("-password");
    res.json(guides);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { getAll, getGuides };
