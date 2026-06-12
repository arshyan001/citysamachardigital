const express = require('express');
const router = express.Router();
const { translateText } = require('../controllers/translateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, translateText);

module.exports = router;
