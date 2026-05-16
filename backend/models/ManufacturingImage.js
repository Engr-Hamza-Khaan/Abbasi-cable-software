const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ManufacturingImage = sequelize.define('ManufacturingImage', {
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
  name: { type: DataTypes.STRING, allowNull: false },
  base64: { type: DataTypes.TEXT('long'), allowNull: false },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = ManufacturingImage;
