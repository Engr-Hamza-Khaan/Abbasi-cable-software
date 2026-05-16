const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttendanceDevice = sequelize.define('AttendanceDevice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    defaultValue: 4370,
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  firmware: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('online', 'offline'),
    defaultValue: 'offline',
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = AttendanceDevice;
