const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getActivityLogs } = require('../controllers/activityController');

router.get('/', protect, authorize('admin'), getActivityLogs);

module.exports = router;
