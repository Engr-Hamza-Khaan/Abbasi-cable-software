const { CashTransaction } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatCashTransaction } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

exports.getTransactions = asyncHandler(async (req, res) => {
  const transactions = await CashTransaction.findAll({
    where: buildShopWhere(req.context),
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });
  res.json({ success: true, data: transactions.map(formatCashTransaction) });
});

exports.createTransaction = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const body = req.body;
  const cashAmount = body.cashAmount ?? body.amount ?? 0;
  const creditAmount = body.creditAmount ?? body.credit ?? 0;
  const amount = body.amount ?? cashAmount + creditAmount;

  const transaction = await CashTransaction.create({
    shopId,
    date: body.date,
    type: body.type,
    amount,
    cashAmount,
    onlineAmount: body.onlineAmount || 0,
    creditAmount,
    source: body.source || 'manual',
    description: body.description,
    referenceId: body.referenceId,
    paymentDetail: body.paymentDetail,
    color: body.color,
  });

  res.status(201).json({ success: true, data: formatCashTransaction(transaction) });
});

exports.updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await CashTransaction.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (['sale', 'purchase'].includes(transaction.source)) {
    res.status(400);
    throw new Error('Linked transactions cannot be edited directly');
  }

  const body = req.body;
  Object.assign(transaction, {
    date: body.date ?? transaction.date,
    type: body.type ?? transaction.type,
    amount: body.amount ?? transaction.amount,
    cashAmount: body.cashAmount ?? transaction.cashAmount,
    onlineAmount: body.onlineAmount ?? transaction.onlineAmount,
    creditAmount: body.creditAmount ?? transaction.creditAmount,
    description: body.description ?? transaction.description,
    paymentDetail: body.paymentDetail ?? transaction.paymentDetail,
  });
  await transaction.save();
  res.json({ success: true, data: formatCashTransaction(transaction) });
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await CashTransaction.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (['sale', 'purchase'].includes(transaction.source)) {
    res.status(400);
    throw new Error('Linked transactions cannot be deleted directly');
  }
  await transaction.destroy();
  res.json({ success: true, message: 'Transaction deleted' });
});
