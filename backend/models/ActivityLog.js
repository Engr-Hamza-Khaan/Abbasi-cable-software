const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define(
  'ActivityLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    userRole: {
      type: DataTypes.ENUM('admin', 'employee'),
      allowNull: true,
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
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
    },
    entityId: {
      type: DataTypes.STRING,
    },
    method: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    metadata: {
      type: DataTypes.JSONB,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    statusCode: {
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      { fields: ['userRole'] },
      { fields: ['shopId'] },
      { fields: ['createdAt'] },
      { fields: ['userId'] },
    ],
  }
);

module.exports = ActivityLog;
