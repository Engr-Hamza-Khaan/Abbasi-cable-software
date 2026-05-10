require('dotenv').config();
const sequelize = require('./config/db');
const { Shop } = require('./models');

const seedShops = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected and synchronized.');

    // Create 4 shops
    const shops = [
      { name: 'Shop 1 - Main Branch', location: 'City Center' },
      { name: 'Shop 2 - West Side', location: 'West Market' },
      { name: 'Shop 3 - East Side', location: 'East Plaza' },
      { name: 'Shop 4 - North Branch', location: 'North Industrial Area' }
    ];

    for (const shopData of shops) {
      const [shop, created] = await Shop.findOrCreate({
        where: { name: shopData.name },
        defaults: shopData
      });
      if (created) {
        console.log(`Created shop: ${shop.name} (${shop.id})`);
      } else {
        console.log(`Shop already exists: ${shop.name}`);
      }
    }

    console.log('Seeding completed.');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedShops();
