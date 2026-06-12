const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(submitContactForm)
  .get(protect, getContactMessages);

router.route('/:id/read')
  .put(protect, markMessageAsRead);

router.route('/:id')
  .delete(protect, deleteContactMessage);

module.exports = router;
