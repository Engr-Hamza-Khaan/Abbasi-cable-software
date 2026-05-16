const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
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
  category: {
    type: DataTypes.ENUM('home', 'shop', 'transport', 'general'),
    defaultValue: 'general',
  },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'cash',
  },
});

module.exports = Expense;
