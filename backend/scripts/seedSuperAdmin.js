require('dotenv').config();
const sequelize = require('../config/db');
const { seedSuperAdmin } = require('../utils/seedSuperAdmin');
const { ensureUserRoleEnum } = require('../utils/ensureSchema');

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureUserRoleEnum();
    await seedSuperAdmin();
    console.log('Super admin seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Super admin seed failed:', err.message);
    process.exit(1);
  }
}

run();
