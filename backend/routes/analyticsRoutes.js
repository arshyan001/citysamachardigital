const express = require('express');
const router = express.Router();
const { trackWebsiteHit, getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/hit', trackWebsiteHit);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
