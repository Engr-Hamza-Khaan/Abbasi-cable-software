const User = require('./User');
const Shop = require('./Shop');
const ActivityLog = require('./ActivityLog');
const Employee = require('./Employee');
const AttendanceDevice = require('./AttendanceDevice');
const AttendanceLog = require('./AttendanceLog');

// Associations
Shop.hasMany(User, { foreignKey: 'shopId' });
User.belongsTo(Shop, { foreignKey: 'shopId' });

User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

Shop.hasMany(ActivityLog, { foreignKey: 'shopId' });
ActivityLog.belongsTo(Shop, { foreignKey: 'shopId' });

// Attendance Associations
Shop.hasMany(AttendanceDevice, { foreignKey: 'shopId' });
AttendanceDevice.belongsTo(Shop, { foreignKey: 'shopId' });

Shop.hasMany(AttendanceLog, { foreignKey: 'shopId' });
AttendanceLog.belongsTo(Shop, { foreignKey: 'shopId' });

AttendanceDevice.hasMany(AttendanceLog, { foreignKey: 'deviceId' });
AttendanceLog.belongsTo(AttendanceDevice, { foreignKey: 'deviceId' });

Employee.hasMany(AttendanceLog, { foreignKey: 'employeeId' });
AttendanceLog.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.belongsTo(Shop, { foreignKey: 'shopId' }); // If employees are specific to a shop
Shop.hasMany(Employee, { foreignKey: 'shopId' });

module.exports = {
  User,
  Shop,
  ActivityLog,
  Employee,
  AttendanceDevice,
  AttendanceLog,
};
