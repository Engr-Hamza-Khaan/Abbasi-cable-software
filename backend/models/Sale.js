const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
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
  productId: { type: DataTypes.UUID },
  variantId: { type: DataTypes.UUID },
  productName: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  size: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  core: { type: DataTypes.STRING },
  length: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  customer: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING },
  paymentType: { type: DataTypes.STRING, defaultValue: 'cash' },
  paymentDetail: { type: DataTypes.STRING },
  cashAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  onlineAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paidAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  credit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  date: { type: DataTypes.DATEONLY, allowNull: false },
});

module.exports = Sale;
