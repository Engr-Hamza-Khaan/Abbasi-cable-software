const express = require('express');
const router = express.Router();
const { ActivityLog, User, Shop } = require('../models');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [
        { model: User, attributes: ['name', 'username'] },
        { model: Shop, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100 // Limit for performance
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a manual activity log from frontend
// @route   POST /api/logs/manual
// @access  Private
router.post('/manual', protect, async (req, res) => {
  try {
    const { action, resource, resourceId, details } = req.body;
    await ActivityLog.create({
      userId: req.user.id,
      shopId: req.user.shopId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
