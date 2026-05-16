const toNum = (v) => (v === null || v === undefined ? 0 : parseFloat(v));

const formatVariant = (v) => ({
  id: v.id,
  label: v.label,
  size: v.size || '',
  type: v.type || '',
  core: v.core || '',
  stock: v.stock,
  unitPrice: toNum(v.unitPrice),
  date: v.date,
});

const formatProduct = (p) => ({
  id: p.id,
  name: p.name,
  unit: p.unit,
  minStock: p.minStock,
  color: p.color,
  variants: (p.variants || []).map(formatVariant),
});

const formatPurchase = (p) => ({
  id: p.id,
  shopId: p.shopId,
  productId: p.productId,
  productName: p.productName,
  color: p.color,
  size: p.size,
  type: p.type,
  core: p.core,
  length: p.length,
  unitPrice: toNum(p.unitPrice),
  total: toNum(p.total),
  vendor: p.vendor,
  contact: p.contact,
  batchLabel: p.batchLabel,
  paymentType: p.paymentType,
  paymentDetail: p.paymentDetail,
  cashAmount: toNum(p.cashAmount),
  onlineAmount: toNum(p.onlineAmount),
  paidAmount: toNum(p.paidAmount),
  credit: toNum(p.credit),
  date: p.date,
});

const formatSale = (s) => ({
  id: s.id,
  shopId: s.shopId,
  productId: s.productId,
  variantId: s.variantId,
  productName: s.productName,
  color: s.color,
  size: s.size,
  type: s.type,
  core: s.core,
  length: s.length,
  price: toNum(s.price),
  total: toNum(s.total),
  customer: s.customer,
  contact: s.contact,
  paymentType: s.paymentType,
  paymentDetail: s.paymentDetail,
  cashAmount: toNum(s.cashAmount),
  onlineAmount: toNum(s.onlineAmount),
  paidAmount: toNum(s.paidAmount),
  credit: toNum(s.credit),
  date: s.date,
});

const formatCashTransaction = (t) => ({
  id: t.id,
  shopId: t.shopId,
  date: t.date,
  type: t.type,
  amount: toNum(t.amount),
  cashAmount: toNum(t.cashAmount),
  onlineAmount: toNum(t.onlineAmount),
  creditAmount: toNum(t.creditAmount),
  source: t.source,
  description: t.description,
  referenceId: t.referenceId,
  paymentDetail: t.paymentDetail,
  color: t.color,
});

const formatExpense = (e) => ({
  id: e.id,
  shopId: e.shopId,
  category: e.category,
  description: e.description,
  amount: toNum(e.amount),
  date: e.date,
  paymentMethod: e.paymentMethod,
});

const formatLedgerCustomer = (c) => ({
  id: c.id,
  name: c.name,
  phone: c.phone || '',
  openingBalance: toNum(c.openingBalance),
  openingDate: c.openingDate,
});

const formatBulty = (b) => ({
  id: b.id,
  agencyName: b.agencyName,
  date: b.date,
  bultyNo: b.bultyNo,
  item: b.item,
  qty: b.qty,
  weight: toNum(b.weight),
  weightRate: toNum(b.weightRate),
  mazduri: toNum(b.mazduri),
  lifterCharges: toNum(b.lifterCharges),
  localRent: toNum(b.localRent),
  nakadKharcha: toNum(b.nakadKharcha),
  sender: b.sender,
  payment: toNum(b.payment),
  paymentDescription: b.paymentDescription,
  total: toNum(b.total),
  inTotal: toNum(b.inTotal),
  balance: toNum(b.balance),
});

const formatManufacturingImage = (img) => ({
  id: img.id,
  name: img.name,
  base64: img.base64,
  date: img.uploadedAt ? new Date(img.uploadedAt).toLocaleString() : '',
});

module.exports = {
  formatProduct,
  formatPurchase,
  formatSale,
  formatCashTransaction,
  formatExpense,
  formatLedgerCustomer,
  formatBulty,
  formatManufacturingImage,
};
