const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SmsLog = sequelize.define('SmsLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerName: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING, // 'Sent', 'Failed'
  },
  errorLog: {
    type: DataTypes.TEXT,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Shops',
      key: 'id',
    },
  },
});

module.exports = SmsLog;
