const sequelize = require('../config/db');
const { Sale, Product, ProductVariant, CashTransaction } = require('../models');
// ProductVariant used via product.variants association
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatSale, formatCashTransaction } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

const calcPayment = (body) => {
  const total = (body.length || 0) * (body.price || 0);
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
  return { total, cashAmount, onlineAmount, paidAmount, credit };
};

exports.getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.findAll({
    where: buildShopWhere(req.context),
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });
  res.json({ success: true, data: sales.map(formatSale) });
});

exports.createSale = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const body = req.body;
  const { total, cashAmount, onlineAmount, paidAmount, credit } = calcPayment(body);

  const result = await sequelize.transaction(async (t) => {
    const product = await Product.findOne({
      where: buildShopWhere(req.context, { id: body.productId }),
      include: [{ model: ProductVariant, as: 'variants' }],
      transaction: t,
    });
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const variant = product.variants.find((v) => v.id === body.variantId);
    if (!variant) throw Object.assign(new Error('Variant not found'), { statusCode: 404 });
    if (variant.stock < body.length) {
      throw Object.assign(
        new Error(`Insufficient stock. Available: ${variant.stock}`),
        { statusCode: 400 }
      );
    }

    variant.stock -= parseInt(body.length, 10);
    await variant.save({ transaction: t });

    const sale = await Sale.create(
      {
        shopId,
        productId: body.productId,
        variantId: body.variantId,
        productName: body.productName || product.name,
        color: body.color || product.color,
        size: body.size || variant.size,
        type: body.type || variant.type,
        core: body.core || variant.core,
        length: body.length,
        price: body.price,
        total,
        customer: body.customer,
        contact: body.contact,
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
        type: 'income',
        amount: total,
        cashAmount,
        onlineAmount,
        creditAmount: credit,
        source: 'sale',
        color: body.color || product.color,
        description: `Sale: ${body.customer || 'Walk-in'} (${body.productName || product.name})`,
        referenceId: sale.id,
        paymentDetail: body.paymentDetail,
      },
      { transaction: t }
    );

    return { sale, cashTx };
  });

  res.status(201).json({
    success: true,
    data: formatSale(result.sale),
    cashTransaction: formatCashTransaction(result.cashTx),
  });
});

exports.deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }

  await sequelize.transaction(async (t) => {
    if (sale.variantId) {
      const variant = await ProductVariant.findByPk(sale.variantId, { transaction: t });
      if (variant) {
        variant.stock += sale.length;
        await variant.save({ transaction: t });
      }
    }
    await CashTransaction.destroy({
      where: { referenceId: sale.id, source: 'sale' },
      transaction: t,
    });
    await sale.destroy({ transaction: t });
  });

  res.json({ success: true, message: 'Sale deleted' });
});
