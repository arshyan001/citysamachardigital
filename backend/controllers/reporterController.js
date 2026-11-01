const User = require('../models/User');
const News = require('../models/News');
const jsonDb = require('../config/jsonDb');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');

// Helper to save photo either to Cloudinary or fallback to local uploads
const savePhoto = async (file) => {
  if (!file) return '';
  try {
    const uploadResult = await uploadToCloudinary(file, 'reporter_photos');
    if (uploadResult && uploadResult.secure_url) {
      return uploadResult.secure_url;
    }
  } catch (err) {
    console.warn('[REPORTER] Cloudinary upload warning, falling back to local storage:', err.message);
  }

  // Fallback to local uploads directory
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `reporter_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${filename}`;
  } catch (localErr) {
    console.error('[REPORTER] Error saving photo locally:', localErr);
    return '';
  }
};

// @desc    Get all reporters with stats
// @route   GET /api/reporters
// @access  Private/Admin
const getReporters = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const reporters = jsonDb.getReporters();
      return res.json(reporters);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const reporters = await User.find({ role: 'reporter' }).select('-password').sort({ createdAt: -1 });
    
    // Attach counts for each reporter
    const reportersWithStats = await Promise.all(
      reporters.map(async (reporter) => {
        const totalArticles = await News.countDocuments({ author: reporter._id });
        const approvedArticles = await News.countDocuments({ author: reporter._id, status: 'approved' });
        const pendingArticles = await News.countDocuments({ author: reporter._id, status: 'pending' });
        return {
          ...reporter.toObject(),
          totalArticles,
          approvedArticles,
          pendingArticles
        };
      })
    );

    res.json(reportersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new reporter
// @route   POST /api/reporters
// @access  Private/Admin
const createReporter = async (req, res) => {
  const { name, username, password, designation, district, phone } = req.body;

  if (!username || !username.trim() || !password || !password.trim()) {
    return res.status(400).json({ message: 'उपयोगकर्ता नाम (Username) और पासवर्ड अनिवार्य हैं।' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  let photoUrl = '';
  if (req.file) {
    photoUrl = await savePhoto(req.file);
  }

  if (global.useJsonDb) {
    try {
      const existing = jsonDb.getUser(cleanUsername);
      if (existing) {
        return res.status(400).json({ message: 'यह उपयोगकर्ता नाम (Username) पहले से मौजूद है।' });
      }
      const newReporter = jsonDb.createReporter({
        name: (name || cleanUsername).trim(),
        username: cleanUsername,
        password: password.trim(),
        designation: (designation || 'संवाददाता').trim(),
        district: district || 'Sant Kabir Nagar',
        phone: (phone || '').trim(),
        photoUrl
      });
      return res.status(201).json(newReporter);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const userExists = await User.findOne({ username: cleanUsername });
    if (userExists) {
      return res.status(400).json({ message: 'यह उपयोगकर्ता नाम (Username) पहले से मौजूद है।' });
    }

    const reporter = new User({
      name: (name || cleanUsername).trim(),
      username: cleanUsername,
      password: password.trim(),
      role: 'reporter',
      designation: (designation || 'संवाददाता').trim(),
      district: district || 'Sant Kabir Nagar',
      phone: (phone || '').trim(),
      photoUrl,
      isActive: true
    });

    await reporter.save();

    res.status(201).json({
      _id: reporter._id,
      name: reporter.name,
      username: reporter.username,
      role: reporter.role,
      designation: reporter.designation,
      district: reporter.district,
      phone: reporter.phone,
      photoUrl: reporter.photoUrl,
      isActive: reporter.isActive
    });
  } catch (error) {
    console.error('Error in createReporter:', error);
    res.status(500).json({ message: error.message || 'संवाददाता बनाने में त्रुटि हुई।' });
  }
};

// @desc    Update reporter details
// @route   PUT /api/reporters/:id
// @access  Private/Admin
const updateReporter = async (req, res) => {
  const { name, username, password, designation, district, phone, isActive } = req.body;

  let newPhotoUrl = null;
  if (req.file) {
    newPhotoUrl = await savePhoto(req.file);
  }

  const cleanUsername = username ? username.trim().toLowerCase().replace(/\s+/g, '') : undefined;

  if (global.useJsonDb) {
    try {
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (cleanUsername !== undefined) updateData.username = cleanUsername;
      if (designation !== undefined) updateData.designation = designation.trim();
      if (district !== undefined) updateData.district = district;
      if (phone !== undefined) updateData.phone = phone.trim();
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
      if (password && password.trim()) updateData.password = password.trim();
      if (newPhotoUrl) updateData.photoUrl = newPhotoUrl;

      const updated = jsonDb.updateReporter(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'Reporter not found' });
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const reporter = await User.findById(req.params.id);
    if (!reporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    if (name !== undefined) reporter.name = name.trim();
    if (cleanUsername !== undefined) reporter.username = cleanUsername;
    if (designation !== undefined) reporter.designation = designation.trim();
    if (district !== undefined) reporter.district = district;
    if (phone !== undefined) reporter.phone = phone.trim();
    if (isActive !== undefined) reporter.isActive = isActive === 'true' || isActive === true;
    if (newPhotoUrl) reporter.photoUrl = newPhotoUrl;
    if (password && password.trim()) reporter.password = password.trim(); // Will be hashed by pre-save hook

    await reporter.save();

    res.json({
      _id: reporter._id,
      name: reporter.name,
      username: reporter.username,
      role: reporter.role,
      designation: reporter.designation,
      district: reporter.district,
      phone: reporter.phone,
      photoUrl: reporter.photoUrl,
      isActive: reporter.isActive
    });
  } catch (error) {
    console.error('Error in updateReporter:', error);
    res.status(500).json({ message: error.message || 'संवाददाता अपडेट करने में त्रुटि हुई।' });
  }
};

// @desc    Delete reporter
// @route   DELETE /api/reporters/:id
// @access  Private/Admin
const deleteReporter = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteReporter(req.params.id);
      if (success) {
        return res.json({ message: 'संवाददाता को सफलतापूर्वक हटा दिया गया।' });
      } else {
        return res.status(404).json({ message: 'Reporter not found' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const reporter = await User.findById(req.params.id);
    if (!reporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'संवाददाता को सफलतापूर्वक हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReporters,
  createReporter,
  updateReporter,
  deleteReporter
};
