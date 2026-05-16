const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LedgerCustomer = sequelize.define('LedgerCustomer', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: { type: DataTypes.STRING },
  openingBalance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  openingDate: { type: DataTypes.DATEONLY },
});

module.exports = LedgerCustomer;
