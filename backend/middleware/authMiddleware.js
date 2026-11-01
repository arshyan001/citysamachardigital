const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretnewschannelkey12345');

      // Get user from the token, excluding password
      if (global.useJsonDb) {
        const jsonDb = require('../config/jsonDb');
        req.user = jsonDb.getUserById(decoded.id);
      } else {
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          req.user = await User.findById(decoded.id).select('-password');
        } else {
          // Fallback: try to find a user by legacy string identifier
          // Assuming the User model may have a 'legacyId' field storing old string IDs
          // This prevents CastError when decoded.id is not a valid ObjectId.
          req.user = await User.findOne({ legacyId: decoded.id }).select('-password');
        }
      }
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({ message: 'आपका खाता निष्क्रिय (Deactivated) कर दिया गया है। एडमिन से संपर्क करें।' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || !req.user.role || req.user.role !== 'reporter')) {
    next();
  } else {
    res.status(403).json({ message: 'केवल मुख्य एडमिन को यह कार्य करने की अनुमति है।' });
  }
};

module.exports = { protect, adminOnly };
