const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
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
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'meter',
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: 'Red',
  },
});

module.exports = Product;
