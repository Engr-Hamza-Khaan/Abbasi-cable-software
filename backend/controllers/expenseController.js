const sequelize = require('../config/db');
const { Expense, CashTransaction } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatExpense, formatCashTransaction } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

const categoryLabels = {
  home: 'Home Expenses',
  shop: 'Shop Expenses',
  transport: 'Transport Expenses',
  general: 'Expenses',
};

exports.getExpenses = asyncHandler(async (req, res) => {
  const where = buildShopWhere(req.context);
  if (req.query.category) where.category = req.query.category;

  const expenses = await Expense.findAll({
    where,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });
  res.json({ success: true, data: expenses.map(formatExpense) });
});

exports.createExpense = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { description, amount, date, category, paymentMethod } = req.body;
  const amt = parseFloat(amount);

  const result = await sequelize.transaction(async (t) => {
    const expense = await Expense.create(
      {
        shopId,
        description,
        amount: amt,
        date,
        category: category || 'general',
        paymentMethod: paymentMethod || 'cash',
      },
      { transaction: t }
    );

    const label = categoryLabels[category] || categoryLabels.general;
    const cashTx = await CashTransaction.create(
      {
        shopId,
        date,
        description: `[${label}] ${description}`,
        amount: amt,
        cashAmount: paymentMethod === 'cash' ? amt : 0,
        onlineAmount: paymentMethod === 'online' ? amt : 0,
        creditAmount: 0,
        type: 'expense',
        source: 'expense',
        referenceId: expense.id,
      },
      { transaction: t }
    );

    return { expense, cashTx };
  });

  res.status(201).json({
    success: true,
    data: formatExpense(result.expense),
    cashTransaction: formatCashTransaction(result.cashTx),
  });
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  await sequelize.transaction(async (t) => {
    await CashTransaction.destroy({
      where: { referenceId: expense.id, source: 'expense' },
      transaction: t,
    });
    await expense.destroy({ transaction: t });
  });

  res.json({ success: true, message: 'Expense deleted' });
});
