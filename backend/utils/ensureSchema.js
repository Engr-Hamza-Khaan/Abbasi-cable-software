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

async function ensureEmployeeShopIdColumn() {
  await sequelize.query(`
    ALTER TABLE "Employees"
    ADD COLUMN IF NOT EXISTS "shopId" UUID;
  `);
}

async function ensureUserRoleEnum() {
  await sequelize.query(`
    DO $$ BEGIN
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'super-admin';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

async function ensureActivityLogUserRoleColumn() {
  await sequelize.query(`
    ALTER TABLE "ActivityLogs"
    ALTER COLUMN "userRole" TYPE VARCHAR(32)
    USING "userRole"::text;
  `).catch(() => {});
}

async function ensureSchema() {
  await ensureSaleInvoiceIdColumn();
  await ensureEmployeeShopIdColumn();
  await ensureUserRoleEnum();
  await ensureActivityLogUserRoleColumn();
}

module.exports = {
  ensureSchema,
  ensureSaleInvoiceIdColumn,
  ensureEmployeeShopIdColumn,
  ensureUserRoleEnum,
  ensureActivityLogUserRoleColumn,
};
