const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getEditorInfo,
  updateEditorInfo,
} = require('../controllers/editorController');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.memoryStorage();

// File filter to accept images only
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif|heic|heif/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const isHeicHeifExt = /heic|heif/.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image/.test(file.mimetype) || (isHeicHeifExt && (file.mimetype === 'application/octet-stream' || !file.mimetype));

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Images only (jpeg, jpg, png, webp, gif, heic, heif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }, // 5MB limit
});

// Editor routes
router.route('/')
  .get(getEditorInfo)
  .put(protect, upload.single('photoFile'), updateEditorInfo);

module.exports = router;
