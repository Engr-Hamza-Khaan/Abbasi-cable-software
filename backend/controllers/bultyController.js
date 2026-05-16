const { BultyRecord } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatBulty } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

const calcTotals = (data) => {
  const weight = parseFloat(data.weight) || 0;
  const rate = parseFloat(data.weightRate) || 0;
  const mazduri = parseFloat(data.mazduri) || 0;
  const lifter = parseFloat(data.lifterCharges) || 0;
  const rent = parseFloat(data.localRent) || 0;
  const nakad = parseFloat(data.nakadKharcha) || 0;
  const payment = parseFloat(data.payment) || 0;
  const total = weight * rate;
  const inTotal = total + mazduri + lifter + rent + nakad;
  const balance = inTotal - payment;
  return { total, inTotal, balance, weight, weightRate: rate, mazduri, lifterCharges: lifter, localRent: rent, nakadKharcha: nakad, payment };
};

exports.getBulties = asyncHandler(async (req, res) => {
  const records = await BultyRecord.findAll({
    where: buildShopWhere(req.context),
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
  });
  res.json({ success: true, data: records.map(formatBulty) });
});

exports.createBulty = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const totals = calcTotals(req.body);

  const record = await BultyRecord.create({
    shopId,
    agencyName: req.body.agencyName,
    date: req.body.date,
    bultyNo: req.body.bultyNo,
    item: req.body.item,
    qty: req.body.qty,
    sender: req.body.sender,
    paymentDescription: req.body.paymentDescription,
    ...totals,
  });

  res.status(201).json({ success: true, data: formatBulty(record) });
});

exports.updateBulty = asyncHandler(async (req, res) => {
  const record = await BultyRecord.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!record) {
    res.status(404);
    throw new Error('Bulty record not found');
  }

  const merged = { ...record.toJSON(), ...req.body };
  const totals = calcTotals(merged);
  Object.assign(record, {
    agencyName: req.body.agencyName ?? record.agencyName,
    date: req.body.date ?? record.date,
    bultyNo: req.body.bultyNo ?? record.bultyNo,
    item: req.body.item ?? record.item,
    qty: req.body.qty ?? record.qty,
    sender: req.body.sender ?? record.sender,
    paymentDescription: req.body.paymentDescription ?? record.paymentDescription,
    ...totals,
  });
  await record.save();
  res.json({ success: true, data: formatBulty(record) });
});

exports.deleteBulty = asyncHandler(async (req, res) => {
  const record = await BultyRecord.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!record) {
    res.status(404);
    throw new Error('Bulty record not found');
  }
  await record.destroy();
  res.json({ success: true, message: 'Bulty record deleted' });
});
