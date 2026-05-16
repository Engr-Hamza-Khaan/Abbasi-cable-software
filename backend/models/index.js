const sequelize = require('../config/db');
const Shop = require('./Shop');
const User = require('./User');
const CustomerDue = require('./CustomerDue');
const SmsLog = require('./SmsLog');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Purchase = require('./Purchase');
const Sale = require('./Sale');
const CashTransaction = require('./CashTransaction');
const Expense = require('./Expense');
const LedgerCustomer = require('./LedgerCustomer');
const BultyRecord = require('./BultyRecord');
const ManufacturingImage = require('./ManufacturingImage');

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Shop.hasMany(Product, { foreignKey: 'shopId' });
Product.belongsTo(Shop, { foreignKey: 'shopId' });

module.exports = {
  sequelize,
  Shop,
  User,
  CustomerDue,
  SmsLog,
  Product,
  ProductVariant,
  Purchase,
  Sale,
  CashTransaction,
  Expense,
  LedgerCustomer,
  BultyRecord,
  ManufacturingImage,
};
