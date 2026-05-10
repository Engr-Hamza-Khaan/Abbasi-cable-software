const User = require('./User');
const Shop = require('./Shop');
const ActivityLog = require('./ActivityLog');

// Associations
Shop.hasMany(User, { foreignKey: 'shopId' });
User.belongsTo(Shop, { foreignKey: 'shopId' });

User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

Shop.hasMany(ActivityLog, { foreignKey: 'shopId' });
ActivityLog.belongsTo(Shop, { foreignKey: 'shopId' });

module.exports = {
  User,
  Shop,
  ActivityLog,
};
