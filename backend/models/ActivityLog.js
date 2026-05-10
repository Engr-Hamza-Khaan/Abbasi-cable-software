const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Shops',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'Bulty', 'Sale', 'User'
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSONB, // Stores the changes or payload
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false, // Activity logs are immutable
});

module.exports = ActivityLog;
