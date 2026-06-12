const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd
} = require('../controllers/adController');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `ad-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter to accept both images and videos
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif|mp4|webm|ogg|mov|quicktime/;
  const mimetype = /image|video/.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Images and Videos only (jpeg, jpg, png, webp, gif, mp4, webm, ogg, mov)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15000000 }, // 15MB limit for video ads
});

// Ad routes
router.route('/')
  .get(getAds)
  .post(protect, upload.single('mediaFile'), createAd);

router.route('/:id')
  .get(getAdById)
  .put(protect, upload.single('mediaFile'), updateAd)
  .delete(protect, deleteAd);

module.exports = router;
