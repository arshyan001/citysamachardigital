const Advertisement = require('../models/Advertisement');
const jsonDb = require('../config/jsonDb');
const fs = require('fs');
const path = require('path');

// @desc    Get all advertisements
// @route   GET /api/ads
// @access  Public
const getAds = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const ads = jsonDb.getAds(req.query);
      return res.json(ads);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const { slot, isActive } = req.query;
    let query = {};
    if (slot) query.slot = slot;
    if (isActive === 'true') query.isActive = true;

    const ads = await Advertisement.find(query).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single advertisement
// @route   GET /api/ads/:id
// @access  Public
const getAdById = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const ad = jsonDb.getAdById(req.params.id);
      if (ad) {
        return res.json(ad);
      } else {
        return res.status(404).json({ message: 'Advertisement not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const ad = await Advertisement.findById(req.params.id);
    if (ad) {
      res.json(ad);
    } else {
      res.status(404).json({ message: 'Advertisement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new advertisement
// @route   POST /api/ads
// @access  Private/Admin
const createAd = async (req, res) => {
  const { title, linkUrl, slot, size, isActive } = req.body;

  let mediaUrl = '';
  let mediaType = 'image';

  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
    if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    }
  } else {
    return res.status(400).json({ message: 'Please upload a photo or video file' });
  }

  if (global.useJsonDb) {
    try {
      const createdAd = jsonDb.createAd({
        title,
        linkUrl,
        mediaType,
        mediaUrl,
        slot: slot || 'sidebar',
        size: size || 'original',
        isActive: isActive === 'true' || isActive === true
      });
      return res.status(201).json(createdAd);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const ad = new Advertisement({
      title,
      linkUrl,
      mediaType,
      mediaUrl,
      slot: slot || 'sidebar',
      size: size || 'original',
      isActive: isActive === 'true' || isActive === true
    });

    const createdAd = await ad.save();
    res.status(201).json(createdAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update advertisement
// @route   PUT /api/ads/:id
// @access  Private/Admin
const updateAd = async (req, res) => {
  const { title, linkUrl, slot, size, isActive } = req.body;

  if (global.useJsonDb) {
    try {
      const existingAd = jsonDb.getAdById(req.params.id);
      if (!existingAd) {
        return res.status(404).json({ message: 'Advertisement not found' });
      }

      let updatePayload = {
        title: title || existingAd.title,
        linkUrl: linkUrl !== undefined ? linkUrl : existingAd.linkUrl,
        slot: slot || existingAd.slot,
        size: size || existingAd.size,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingAd.isActive
      };

      if (req.file) {
        // Delete old file
        try {
          if (existingAd.mediaUrl && existingAd.mediaUrl.startsWith('/uploads/')) {
            const absolutePath = path.join(__dirname, '..', existingAd.mediaUrl);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          }
        } catch (err) {
          console.error(err);
        }

        updatePayload.mediaUrl = `/uploads/${req.file.filename}`;
        updatePayload.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      }

      const updatedAd = jsonDb.updateAd(req.params.id, updatePayload);
      return res.json(updatedAd);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const ad = await Advertisement.findById(req.params.id);

    if (ad) {
      ad.title = title || ad.title;
      ad.linkUrl = linkUrl !== undefined ? linkUrl : ad.linkUrl;
      ad.slot = slot || ad.slot;
      ad.size = size || ad.size;
      ad.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : ad.isActive;

      if (req.file) {
        // Delete old file from disk
        try {
          if (ad.mediaUrl && ad.mediaUrl.startsWith('/uploads/')) {
            const absolutePath = path.join(__dirname, '..', ad.mediaUrl);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          }
        } catch (err) {
          console.error('Error deleting old ad file:', err);
        }

        ad.mediaUrl = `/uploads/${req.file.filename}`;
        ad.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      }

      const updatedAd = await ad.save();
      res.json(updatedAd);
    } else {
      res.status(404).json({ message: 'Advertisement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete advertisement
// @route   DELETE /api/ads/:id
// @access  Private/Admin
const deleteAd = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteAd(req.params.id);
      if (success) {
        return res.json({ message: 'Advertisement removed' });
      } else {
        return res.status(404).json({ message: 'Advertisement not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const ad = await Advertisement.findById(req.params.id);

    if (ad) {
      // Delete file from disk
      try {
        if (ad.mediaUrl && ad.mediaUrl.startsWith('/uploads/')) {
          const absolutePath = path.join(__dirname, '..', ad.mediaUrl);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        }
      } catch (err) {
        console.error('Error deleting ad file:', err);
      }

      await Advertisement.deleteOne({ _id: req.params.id });
      res.json({ message: 'Advertisement removed' });
    } else {
      res.status(404).json({ message: 'Advertisement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd
};
