/**
 * One-time script: clear shopId on admin users so they get super access to all shops.
 * Run: node scripts/fixAdminShopId.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/db');
const User = require('../models/User');

async function run() {
  try {
    await sequelize.authenticate();
    const [count] = await User.update(
      { shopId: null },
      { where: { role: 'admin' } }
    );
    console.log(`Updated ${count} admin user(s): shopId set to null.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
