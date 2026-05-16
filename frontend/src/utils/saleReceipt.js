/** Normalize a sale row or invoice group into receipt shape for printing. */
export const toReceipt = (data) => {
  if (data?.items?.length) return data;
  return {
    ...data,
    items: [{
      productName: data.productName,
      size: data.size,
      type: data.type,
      core: data.core,
      color: data.color,
      length: data.length,
      price: data.price,
      total: data.total,
    }],
  };
};

const legacyBatchKey = (sale) =>
  `${sale.date}|${(sale.customer || '').trim().toLowerCase()}|${(sale.contact || '').trim()}|${sale.paymentType || ''}|${sale.paymentDetail || ''}`;

const toLineItem = (sale) => ({
  id: sale.id,
  productName: sale.productName,
  size: sale.size,
  type: sale.type,
  core: sale.core,
  color: sale.color,
  length: sale.length,
  price: sale.price,
  total: sale.total,
});

export const buildInvoiceGroup = (items) => {
  const sorted = [...items].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
  const first = sorted[0];
  const total = sorted.reduce((sum, i) => sum + (i.total || 0), 0);
  const cashAmount = sorted.reduce((sum, i) => sum + (i.cashAmount || 0), 0);
  const onlineAmount = sorted.reduce((sum, i) => sum + (i.onlineAmount || 0), 0);
  const paidAmount = cashAmount + onlineAmount;

  return {
    id: first.invoiceId || first.id,
    invoiceId: first.invoiceId || null,
    date: first.date,
    customer: first.customer,
    contact: first.contact,
    paymentType: first.paymentType,
    paymentDetail: first.paymentDetail,
    items: sorted.map(toLineItem),
    itemCount: sorted.length,
    isMultiItem: sorted.length > 1,
    total,
    cashAmount,
    onlineAmount,
    paidAmount,
    credit: Math.max(0, total - paidAmount),
  };
};

/** Group line-item sales into one row per invoice (matches cart / thermal print). */
export const groupSalesByInvoice = (sales) => {
  const invoiceMap = new Map();
  const orphans = [];

  for (const sale of sales) {
    if (sale.invoiceId) {
      const key = `inv:${sale.invoiceId}`;
      if (!invoiceMap.has(key)) invoiceMap.set(key, []);
      invoiceMap.get(key).push(sale);
    } else {
      orphans.push(sale);
    }
  }

  const used = new Set();
  orphans.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return ta - tb;
  });

  for (let i = 0; i < orphans.length; i++) {
    if (used.has(i)) continue;
    const cluster = [orphans[i]];
    used.add(i);
    const base = orphans[i];
    const batchKey = legacyBatchKey(base);
    const baseTime = base.createdAt
      ? new Date(base.createdAt).getTime()
      : new Date(base.date).getTime();

    for (let j = i + 1; j < orphans.length; j++) {
      if (used.has(j)) continue;
      const other = orphans[j];
      if (legacyBatchKey(other) !== batchKey) continue;
      const otherTime = other.createdAt
        ? new Date(other.createdAt).getTime()
        : new Date(other.date).getTime();
      if (Math.abs(otherTime - baseTime) <= 60000) {
        cluster.push(other);
        used.add(j);
      }
    }

    const key = cluster.length === 1
      ? `solo:${cluster[0].id}`
      : `legacy:${batchKey}:${baseTime}`;
    invoiceMap.set(key, cluster);
  }

  return Array.from(invoiceMap.values())
    .map(buildInvoiceGroup)
    .sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      if (da !== db) return db.localeCompare(da);
      const ta = a.items[0]?.createdAt || '';
      const tb = b.items[0]?.createdAt || '';
      return tb.localeCompare(ta);
    });
};

export const saleMatchesSearch = (sale, term) => {
  const q = term.toLowerCase();
  return (
    sale.productName?.toLowerCase().includes(q) ||
    sale.customer?.toLowerCase().includes(q)
  );
};

export const invoiceMatchesSearch = (invoice, term) => {
  if (!term) return true;
  const q = term.toLowerCase();
  if (invoice.customer?.toLowerCase().includes(q)) return true;
  return invoice.items.some((item) => item.productName?.toLowerCase().includes(q));
};
