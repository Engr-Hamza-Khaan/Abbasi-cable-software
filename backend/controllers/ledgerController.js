const { LedgerCustomer } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatLedgerCustomer } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await LedgerCustomer.findAll({
    where: buildShopWhere(req.context),
    order: [['name', 'ASC']],
  });
  res.json({ success: true, data: customers.map(formatLedgerCustomer) });
});

exports.upsertCustomer = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { name, phone, openingBalance, openingDate } = req.body;
  const normalizedName = name.trim().toUpperCase();

  let customer = await LedgerCustomer.findOne({
    where: buildShopWhere(req.context, { name: normalizedName }),
  });

  if (customer) {
    customer.phone = phone ?? customer.phone;
    customer.openingBalance = openingBalance ?? customer.openingBalance;
    customer.openingDate = openingDate ?? customer.openingDate;
    await customer.save();
  } else {
    customer = await LedgerCustomer.create({
      shopId,
      name: normalizedName,
      phone: phone || '',
      openingBalance: openingBalance || 0,
      openingDate: openingDate || '2020-01-01',
    });
  }

  res.json({ success: true, data: formatLedgerCustomer(customer) });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await LedgerCustomer.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  await customer.destroy();
  res.json({ success: true, message: 'Customer metadata deleted' });
});
