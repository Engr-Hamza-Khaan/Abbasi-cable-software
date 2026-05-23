const { Op } = require('sequelize');
const User = require('../models/User');

const SUPER_ADMIN = {
  name: 'Hamza Khan',
  username: 'mrHamza',
  email: 'engrhamzakhanofficial@gmail.com',
  password: 'Hamza03079357521',
  role: 'super-admin',
  shopId: null,
};

async function seedSuperAdmin() {
  const existing = await User.findOne({
    where: {
      [Op.or]: [
        { role: 'super-admin' },
        { username: SUPER_ADMIN.username },
        { email: SUPER_ADMIN.email },
      ],
    },
  });

  if (existing) {
    return;
  }

  await User.create(SUPER_ADMIN, { validate: false });
  console.log('Super admin account seeded (mrHamza).');
}

module.exports = { seedSuperAdmin, SUPER_ADMIN };
