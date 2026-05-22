const express = require('express');
const router = express.Router();
const { ActivityLog, User, Shop } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [
        { model: User, attributes: ['name', 'username'] },
        { model: Shop, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
