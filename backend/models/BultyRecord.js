const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BultyRecord = sequelize.define('BultyRecord', {
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
  agencyName: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  bultyNo: { type: DataTypes.STRING, allowNull: false },
  item: { type: DataTypes.STRING },
  qty: { type: DataTypes.STRING },
  weight: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  weightRate: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  mazduri: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  lifterCharges: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  localRent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  nakadKharcha: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  sender: { type: DataTypes.STRING },
  payment: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paymentDescription: { type: DataTypes.TEXT },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  inTotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
});

module.exports = BultyRecord;
