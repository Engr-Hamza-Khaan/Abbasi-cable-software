const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CashTransaction = sequelize.define('CashTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Shops', key: 'id' },
  },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  cashAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  onlineAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  creditAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  source: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  referenceId: { type: DataTypes.STRING },
  paymentDetail: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
});

module.exports = CashTransaction;
