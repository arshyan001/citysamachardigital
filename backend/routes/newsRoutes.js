const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getCategories,
  createCategory,
  deleteCategory,
  addComment,
  getAllComments,
  deleteComment,
  likeNews,
  shareNews,
} = require('../controllers/newsController');
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
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter (optional but good)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Images only (jpeg, jpg, png, webp, gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }, // 5MB limit
});

// Category routes
router.route('/categories')
  .get(getCategories)
  .post(protect, createCategory);

router.route('/categories/:id')
  .delete(protect, deleteCategory);

// Comment routes
router.route('/comments/all')
  .get(protect, getAllComments);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

// News routes
router.route('/')
  .get(getNews)
  .post(protect, upload.array('images', 5), createNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, upload.array('images', 5), updateNews)
  .delete(protect, deleteNews);

router.route('/:id/comments')
  .post(addComment);

router.route('/:id/like')
  .post(likeNews);

router.route('/:id/share')
  .post(shareNews);

module.exports = router;
