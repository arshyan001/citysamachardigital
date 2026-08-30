const express = require('express');
const router = express.Router();
const {
  getSubdivisions,
  createSubdivision,
  deleteSubdivision,
} = require('../controllers/subdivisionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSubdivisions)
  .post(protect, createSubdivision);

router.route('/:name')
  .delete(protect, deleteSubdivision);

module.exports = router;
