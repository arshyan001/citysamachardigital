const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getEPapers,
  getEPaperByDate,
  createEPaper,
  deleteEPaper,
} = require('../controllers/epaperController');
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
      `epaper-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter to check for pdf and images
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf' && file.mimetype === 'application/pdf';
    if (isPdf) {
      return cb(null, true);
    }
    return cb(new Error('Only PDF files are allowed for the pdf field!'), false);
  } else if (file.fieldname === 'thumbnail') {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed for the thumbnail field!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const cpUpload = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

router.route('/')
  .get(getEPapers)
  .post(protect, cpUpload, createEPaper);

router.route('/date/:date')
  .get(getEPaperByDate);

router.route('/:id')
  .delete(protect, deleteEPaper);

module.exports = router;
