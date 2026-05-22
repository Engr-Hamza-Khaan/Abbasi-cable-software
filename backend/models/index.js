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
const ActivityLog = require('./ActivityLog');
const Employee = require('./Employee');
const AttendanceDevice = require('./AttendanceDevice');
const AttendanceLog = require('./AttendanceLog');

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Shop.hasMany(Product, { foreignKey: 'shopId' });
Product.belongsTo(Shop, { foreignKey: 'shopId' });

Shop.hasMany(User, { foreignKey: 'shopId' });
User.belongsTo(Shop, { foreignKey: 'shopId' });

User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });
Shop.hasMany(ActivityLog, { foreignKey: 'shopId' });
ActivityLog.belongsTo(Shop, { foreignKey: 'shopId' });

Shop.hasMany(AttendanceDevice, { foreignKey: 'shopId' });
AttendanceDevice.belongsTo(Shop, { foreignKey: 'shopId' });

Shop.hasMany(AttendanceLog, { foreignKey: 'shopId' });
AttendanceLog.belongsTo(Shop, { foreignKey: 'shopId' });

AttendanceDevice.hasMany(AttendanceLog, { foreignKey: 'deviceId' });
AttendanceLog.belongsTo(AttendanceDevice, { foreignKey: 'deviceId' });

Employee.hasMany(AttendanceLog, { foreignKey: 'employeeId' });
AttendanceLog.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.belongsTo(Shop, { foreignKey: 'shopId' });
Shop.hasMany(Employee, { foreignKey: 'shopId' });

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
  ActivityLog,
  Employee,
  AttendanceDevice,
  AttendanceLog,
};
