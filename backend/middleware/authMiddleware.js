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

module.exports = { protect };
