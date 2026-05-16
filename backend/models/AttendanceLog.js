const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttendanceLog = sequelize.define('AttendanceLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: true, // Optional if we only have deviceUserId initially
  },
  deviceUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  state: {
    type: DataTypes.INTEGER, // 0=IN, 1=OUT, 2=BREAK_OUT, 3=BREAK_IN, 4=OT_IN, 5=OT_OUT
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // IN, OUT, etc.
    allowNull: true,
  },
  raw: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  syncSource: {
    type: DataTypes.STRING,
    defaultValue: 'agent',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['deviceId', 'deviceUserId', 'timestamp']
    },
    {
      fields: ['shopId']
    },
    {
      fields: ['employeeId']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = AttendanceLog;
