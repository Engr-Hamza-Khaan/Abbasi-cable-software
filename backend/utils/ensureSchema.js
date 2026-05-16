const sequelize = require('../config/db');

/**
 * Adds missing columns that sync() does not apply to existing tables.
 */
async function ensureSaleInvoiceIdColumn() {
  await sequelize.query(`
    ALTER TABLE "Sales"
    ADD COLUMN IF NOT EXISTS "invoiceId" UUID;
  `);
}

async function ensureSchema() {
  await ensureSaleInvoiceIdColumn();
}

module.exports = { ensureSchema, ensureSaleInvoiceIdColumn };
