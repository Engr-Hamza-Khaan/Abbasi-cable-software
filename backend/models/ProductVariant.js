const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
    onDelete: 'CASCADE',
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  core: { type: DataTypes.STRING },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  date: { type: DataTypes.DATEONLY },
});

module.exports = ProductVariant;
