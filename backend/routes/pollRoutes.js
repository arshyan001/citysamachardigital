const express = require('express');
const router = express.Router();
const { getPoll, votePoll, updatePoll } = require('../controllers/pollController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPoll)
  .put(protect, updatePoll);

router.post('/vote', votePoll);

module.exports = router;
