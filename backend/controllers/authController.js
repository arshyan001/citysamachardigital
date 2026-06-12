const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jsonDb = require('../config/jsonDb');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretnewschannelkey12345', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (global.useJsonDb) {
    try {
      const user = jsonDb.getUser(username);
      if (user && bcrypt.compareSync(password, user.password)) {
        return res.json({
          _id: user._id,
          username: user.username,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (verify token status)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const user = jsonDb.getUserById(req.user._id);
      if (user) {
        return res.json(user);
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { username, password } = req.body;
  if (!username && !password) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  if (global.useJsonDb) {
    try {
      const updatedUser = jsonDb.updateUser(req.user._id, { username, password });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      const token = generateToken(updatedUser._id);
      return res.json({ _id: updatedUser._id, username: updatedUser.username, token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username) user.username = username;
    if (password) user.password = password; // pre-save hook will hash
    await user.save();
    // Update token if needed (optional)
    const token = generateToken(user._id);
    // Update stored username in response
    res.json({ _id: user._id, username: user.username, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, getUserProfile, updateUserProfile,
  loginUser,
  getUserProfile,
};
