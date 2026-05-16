const sequelize = require('../config/db');
const { Purchase, Product, ProductVariant, CashTransaction } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatPurchase, formatCashTransaction } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

exports.getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.findAll({
    where: buildShopWhere(req.context),
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });
  res.json({ success: true, data: purchases.map(formatPurchase) });
});

exports.createPurchase = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const body = req.body;
  const total = (body.length || 0) * (body.unitPrice || 0);

  let cashAmount = 0;
  let onlineAmount = 0;
  if (body.paymentType === 'online') {
    onlineAmount = body.onlineAmount || 0;
  } else if (body.paymentType === 'cash') {
    cashAmount = body.cashAmount || 0;
  } else {
    cashAmount = body.cashAmount || 0;
    onlineAmount = body.onlineAmount || 0;
  }
  const paidAmount = cashAmount + onlineAmount;
  const credit = total - paidAmount;

  const result = await sequelize.transaction(async (t) => {
    const product = await Product.findOne({
      where: buildShopWhere(req.context, { id: body.productId }),
      transaction: t,
    });
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const variant = await ProductVariant.create(
      {
        productId: product.id,
        label: body.batchLabel || `Purchase - ${body.date}`,
        size: body.size,
        type: body.type,
        core: body.core,
        stock: parseInt(body.length, 10) || 0,
        unitPrice: body.unitPrice || 0,
        date: body.date,
      },
      { transaction: t }
    );

    const purchase = await Purchase.create(
      {
        shopId,
        productId: body.productId,
        productName: body.productName || product.name,
        color: body.color || product.color,
        size: body.size,
        type: body.type,
        core: body.core,
        length: body.length,
        unitPrice: body.unitPrice,
        total,
        vendor: body.vendor,
        contact: body.contact,
        batchLabel: body.batchLabel,
        paymentType: body.paymentType || 'cash',
        paymentDetail: body.paymentDetail,
        cashAmount,
        onlineAmount,
        paidAmount,
        credit,
        date: body.date,
      },
      { transaction: t }
    );

    const cashTx = await CashTransaction.create(
      {
        shopId,
        date: body.date,
        type: 'expense',
        amount: total,
        cashAmount,
        onlineAmount,
        creditAmount: credit,
        source: 'purchase',
        color: body.color || product.color,
        description: `Purchase: ${body.productName || product.name} from ${body.vendor || 'Unknown'}`,
        referenceId: purchase.id,
        paymentDetail: body.paymentDetail,
      },
      { transaction: t }
    );

    return { purchase, cashTx, variant };
  });

  res.status(201).json({
    success: true,
    data: formatPurchase(result.purchase),
    cashTransaction: formatCashTransaction(result.cashTx),
    variantId: result.variant.id,
  });
});

exports.deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!purchase) {
    res.status(404);
    throw new Error('Purchase not found');
  }

  await sequelize.transaction(async (t) => {
    await CashTransaction.destroy({
      where: { referenceId: purchase.id, source: 'purchase' },
      transaction: t,
    });
    await purchase.destroy({ transaction: t });
  });

  res.json({ success: true, message: 'Purchase deleted' });
});
