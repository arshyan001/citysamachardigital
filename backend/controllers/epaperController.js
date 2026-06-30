const EPaper = require('../models/EPaper');
const jsonDb = require('../config/jsonDb');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all E-Papers
// @route   GET /api/epaper
// @access  Public
const getEPapers = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const epapers = jsonDb.getEPapers();
      return res.json(epapers);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const epapers = await EPaper.find({}).sort({ date: -1 });
    res.json(epapers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get E-Paper by date
// @route   GET /api/epaper/date/:date
// @access  Public
const getEPaperByDate = async (req, res) => {
  const { date } = req.params; // format YYYY-MM-DD
  if (global.useJsonDb) {
    try {
      const epaper = jsonDb.getEPaperByDate(date);
      if (epaper) {
        return res.json(epaper);
      }
      return res.status(404).json({ message: 'No E-Paper found for this date' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const epaper = await EPaper.findOne({ date });
    if (epaper) {
      return res.json(epaper);
    }
    res.status(404).json({ message: 'No E-Paper found for this date' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Upload E-Paper
// @route   POST /api/epaper
// @access  Private/Admin
// @desc    Create/Upload E-Paper
// @route   POST /api/epaper
// @access  Private/Admin
const createEPaper = async (req, res) => {
  try {
    const { titleEn, titleHi, date } = req.body;
    
    if (!titleEn || !titleHi || !date) {
      return res.status(400).json({ message: 'Title (EN), Title (HI), and Date are required' });
    }

    if (!req.files || !req.files['pdf']) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Check if an epaper already exists for this date, for file cleanup
    let existingEPaper = null;
    if (global.useJsonDb) {
      existingEPaper = jsonDb.getEPaperByDate(date);
    } else {
      existingEPaper = await EPaper.findOne({ date });
    }

    if (existingEPaper) {
      try {
        if (existingEPaper.pdfUrl) {
          if (existingEPaper.pdfUrl.startsWith('/uploads/')) {
            const absolutePath = path.join(__dirname, '..', existingEPaper.pdfUrl);
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
          } else {
            await deleteFromCloudinary(existingEPaper.pdfUrl);
          }
        }
        if (existingEPaper.thumbnailUrl) {
          if (existingEPaper.thumbnailUrl.startsWith('/uploads/')) {
            const absolutePath = path.join(__dirname, '..', existingEPaper.thumbnailUrl);
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
          } else {
            await deleteFromCloudinary(existingEPaper.thumbnailUrl);
          }
        }
      } catch (err) {
        console.error('Error deleting old files of overwritten epaper:', err);
      }
      
      if (!global.useJsonDb) {
        await EPaper.deleteOne({ _id: existingEPaper._id });
      }
    }

    // Upload PDF to Cloudinary
    const pdfFile = req.files['pdf'][0];
    const pdfUpload = await uploadToCloudinary(pdfFile, 'epapers');
    const pdfUrl = pdfUpload.secure_url;
    
    let thumbnailUrl = '';
    if (req.files['thumbnail']) {
      const thumbFile = req.files['thumbnail'][0];
      const thumbUpload = await uploadToCloudinary(thumbFile, 'epaper_thumbnails');
      thumbnailUrl = thumbUpload.secure_url;
    }

    if (global.useJsonDb) {
      const epaper = jsonDb.createEPaper({
        titleEn,
        titleHi,
        date,
        pdfUrl,
        thumbnailUrl
      });
      return res.status(201).json(epaper);
    }

    // Mongoose mode
    const epaper = new EPaper({
      titleEn,
      titleHi,
      date,
      pdfUrl,
      thumbnailUrl
    });

    const savedEPaper = await epaper.save();
    res.status(201).json(savedEPaper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete E-Paper
// @route   DELETE /api/epaper/:id
// @access  Private/Admin
const deleteEPaper = async (req, res) => {
  const { id } = req.params;

  let epaper = null;
  if (global.useJsonDb) {
    const epapers = jsonDb.getEPapers();
    epaper = epapers.find(e => e._id === id);
  } else {
    try {
      epaper = await EPaper.findById(id);
    } catch (err) {}
  }

  if (!epaper) {
    return res.status(404).json({ message: 'E-Paper not found' });
  }

  // Delete files from storage
  try {
    if (epaper.pdfUrl) {
      if (epaper.pdfUrl.startsWith('/uploads/')) {
        const absolutePdfPath = path.join(__dirname, '..', epaper.pdfUrl);
        if (fs.existsSync(absolutePdfPath)) {
          fs.unlinkSync(absolutePdfPath);
        }
      } else {
        await deleteFromCloudinary(epaper.pdfUrl);
      }
    }
    if (epaper.thumbnailUrl) {
      if (epaper.thumbnailUrl.startsWith('/uploads/')) {
        const absoluteThumbPath = path.join(__dirname, '..', epaper.thumbnailUrl);
        if (fs.existsSync(absoluteThumbPath)) {
          fs.unlinkSync(absoluteThumbPath);
        }
      } else {
        await deleteFromCloudinary(epaper.thumbnailUrl);
      }
    }
  } catch (err) {
    console.error('Error deleting epaper files from Cloudinary/disk:', err);
  }

  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteEPaper(id);
      if (success) {
        return res.json({ message: 'E-Paper deleted successfully' });
      }
      return res.status(404).json({ message: 'E-Paper not found' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    await EPaper.deleteOne({ _id: id });
    res.json({ message: 'E-Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEPapers,
  getEPaperByDate,
  createEPaper,
  deleteEPaper
};
