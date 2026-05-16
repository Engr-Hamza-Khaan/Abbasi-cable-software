require('dotenv').config();
const sequelize = require('../config/db');
const Shop = require('../models/Shop');

const shops = [
  {
    name: 'Abbasi Cable - Main Branch',
    location: 'Saddar, Karachi',
    phone: '021-1234567',
  },
  {
    name: 'Abbasi Cable - Gulshan',
    location: 'Gulshan-e-Iqbal, Karachi',
    phone: '021-2345678',
  },
  {
    name: 'Abbasi Cable - North Nazimabad',
    location: 'North Nazimabad, Karachi',
    phone: '021-3456789',
  },
  {
    name: 'Abbasi Cable - Malir',
    location: 'Malir, Karachi',
    phone: '021-4567890',
  },
];

async function seedShops() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await Shop.count();
    if (existing >= 4) {
      console.log(`Shops table already has ${existing} record(s). Skipping seed.`);
      const all = await Shop.findAll();
      all.forEach((s) => console.log(`  - ${s.name} (${s.id})`));
      process.exit(0);
    }

    const created = await Shop.bulkCreate(shops);
    console.log(`Inserted ${created.length} shops:`);
    created.forEach((s) => console.log(`  - ${s.name} (${s.id})`));
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seedShops();
