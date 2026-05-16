/**
 * One-time: add invoiceId to Sales for grouped invoice history.
 * Run: node scripts/addInvoiceIdColumn.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/db');
const { ensureSaleInvoiceIdColumn } = require('../utils/ensureSchema');

async function run() {
  try {
    await sequelize.authenticate();
    await ensureSaleInvoiceIdColumn();
    console.log('Sales.invoiceId column is ready.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
