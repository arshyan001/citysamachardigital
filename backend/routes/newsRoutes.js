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
  getPendingNews,
  updateNewsStatus,
  getMyNews,
} = require('../controllers/newsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.memoryStorage();

// File filter (optional but good)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif|heic|heif/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const isHeicHeifExt = /heic|heif/.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || (isHeicHeifExt && (file.mimetype === 'application/octet-stream' || !file.mimetype));

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Images only (jpeg, jpg, png, webp, gif, heic, heif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10000000 }, // 10MB limit
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

// Review and Reporter News routes (Declared before /:id)
router.route('/pending')
  .get(protect, adminOnly, getPendingNews);

router.route('/my-news')
  .get(protect, getMyNews);

router.route('/:id/status')
  .put(protect, adminOnly, updateNewsStatus);

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
