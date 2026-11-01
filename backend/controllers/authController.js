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
        if (user.isActive === false) {
          return res.status(403).json({ message: 'आपका खाता निष्क्रिय (Deactivated) कर दिया गया है। एडमिन से संपर्क करें।' });
        }
        const role = user.role || (user.username === 'admin' ? 'admin' : 'reporter');
        return res.json({
          _id: user._id,
          username: user.username,
          name: user.name || (role === 'admin' ? 'सदरे आलम खान' : user.username),
          role,
          photoUrl: user.photoUrl || '',
          designation: user.designation || (role === 'admin' ? 'मुख्य संपादक' : 'संवाददाता'),
          district: user.district || 'Sant Kabir Nagar',
          phone: user.phone || '',
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'गलत यूज़रनेम या पासवर्ड।' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      if (user.isActive === false) {
        return res.status(403).json({ message: 'आपका खाता निष्क्रिय (Deactivated) कर दिया गया है। एडमिन से संपर्क करें।' });
      }
      const role = user.role || (user.username === 'admin' ? 'admin' : 'reporter');
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name || (role === 'admin' ? 'सदरे आलम खान' : user.username),
        role,
        photoUrl: user.photoUrl || '',
        designation: user.designation || (role === 'admin' ? 'मुख्य संपादक' : 'संवाददाता'),
        district: user.district || 'Sant Kabir Nagar',
        phone: user.phone || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'गलत यूज़रनेम या पासवर्ड।' });
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
      const role = user.role || (user.username === 'admin' ? 'admin' : 'reporter');
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name || (role === 'admin' ? 'सदरे आलम खान' : user.username),
        role,
        designation: user.designation || (role === 'admin' ? 'मुख्य संपादक' : 'संवाददाता'),
        district: user.district || 'Sant Kabir Nagar',
        photoUrl: user.photoUrl || '',
        phone: user.phone || ''
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
