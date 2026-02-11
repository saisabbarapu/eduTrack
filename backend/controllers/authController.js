const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role, department, batchYear, rollNumber } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role required' });
    }
    if (role === 'student' && !rollNumber) {
      return res.status(400).json({ error: 'Roll number is required for student registration' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    if (role === 'student') {
      const rn = String(rollNumber).trim();
      const rollExists = await User.findOne({ rollNumber: rn });
      if (rollExists) return res.status(400).json({ error: 'Roll number already registered' });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role,
      department: department || '',
      batchYear: batchYear || '',
      rollNumber: role === 'student' ? String(rollNumber).trim() : undefined
    });
    await user.save();
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'edutrack_secret',
      { expiresIn: '7d' }
    );
    const u = await User.findById(user._id).select('-password');
    res.status(201).json({ user: u, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'edutrack_secret',
      { expiresIn: '7d' }
    );
    const u = await User.findById(user._id).select('-password');
    res.json({ user: u, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
