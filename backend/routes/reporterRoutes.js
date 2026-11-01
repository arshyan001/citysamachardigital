const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getReporters,
  createReporter,
  updateReporter,
  deleteReporter
} = require('../controllers/reporterController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  const filetypes = /jpeg|jpg|png|webp|gif|heic|heif|jfif|bmp/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('केवल फ़ोटो (JPEG, JPG, PNG, WEBP) फ़ाइलें अपलोड की जा सकती हैं।'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Middleware to catch multer errors cleanly and return JSON instead of 500
const uploadSingle = (req, res, next) => {
  upload.single('photoFile')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'फ़ोटो का साइज़ 25MB से कम होना चाहिए।' });
      }
      return res.status(400).json({ message: err.message || 'फ़ोटो अपलोड करने में त्रुटि।' });
    }
    next();
  });
};

router.route('/')
  .get(protect, adminOnly, getReporters)
  .post(protect, adminOnly, uploadSingle, createReporter);

router.route('/:id')
  .put(protect, adminOnly, uploadSingle, updateReporter)
  .delete(protect, adminOnly, deleteReporter);

module.exports = router;
