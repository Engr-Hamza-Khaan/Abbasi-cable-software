const { Op } = require('sequelize');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    role,
    shopId,
    userId,
    action,
    page = 1,
    limit = 50,
    startDate,
    endDate,
  } = req.query;

  const where = {
    method: { [Op.in]: ['POST', 'PUT', 'PATCH', 'DELETE'] },
    userRole: { [Op.in]: ['admin', 'employee'] },
  };

  if (role === 'admin' || role === 'employee') {
    where.userRole = role;
  }

  if (shopId) {
    where.shopId = shopId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = { [Op.iLike]: `%${action}%` };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  const { rows, count } = await ActivityLog.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'username', 'role', 'shopId'],
        required: false,
      },
      {
        model: Shop,
        attributes: ['id', 'name'],
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset,
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      pages: Math.ceil(count / limitNum),
    },
  });
});

module.exports = { getActivityLogs };
