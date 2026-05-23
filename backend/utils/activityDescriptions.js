const MODULE_LABELS = {
  products: 'Product',
  sales: 'Sale',
  purchases: 'Purchase',
  'cash-flow': 'Cash Transaction',
  expenses: 'Expense',
  ledger: 'Ledger Customer',
  bulty: 'Bulty Record',
  manufacturing: 'Manufacturing Image',
  reminders: 'Reminder Customer',
  shops: 'Shop',
  auth: 'Account',
  users: 'User',
  'activity-logs': 'Activity Log',
};

const METHOD_VERBS = {
  POST: 'Created',
  PUT: 'Updated',
  PATCH: 'Updated',
  DELETE: 'Deleted',
};

const getModuleFromPath = (path) => {
  const segments = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  return segments[0] || 'unknown';
};

const getEntityId = (req, responseData) => {
  if (req.params?.id) return String(req.params.id);
  const data = responseData?.data ?? responseData;
  if (data?.id) return String(data.id);
  if (data?.data?.id) return String(data.data.id);
  return null;
};

const buildActionKey = (req) => {
  const module = getModuleFromPath(req.baseUrl || req.originalUrl);
  const subPath = (req.route?.path || req.path || '').replace(/^\//, '');
  const method = req.method;

  if (module === 'auth' && req.path.includes('register')) return 'USER_REGISTERED';

  if (module === 'reminders' && subPath.includes('send-sms')) return 'SMS_SENT';
  if (module === 'products' && subPath === 'bulk') return 'PRODUCT_BULK_CREATE';
  if (module === 'manufacturing' && subPath === 'bulk') return 'MANUFACTURING_BULK_UPLOAD';
  if (module === 'ledger' && method === 'POST') return 'LEDGER_UPSERT';

  const entity = (MODULE_LABELS[module] || module).toUpperCase().replace(/\s+/g, '_');
  return `${method}_${entity}`;
};

const buildDescription = (req, actionKey) => {
  const module = getModuleFromPath(req.baseUrl || req.originalUrl);
  const label = MODULE_LABELS[module] || module;
  const method = req.method;
  const subPath = (req.route?.path || req.path || '').replace(/^\//, '');

  if (actionKey === 'USER_REGISTERED') return 'New user account created';
  if (actionKey === 'SMS_SENT') return 'Manual SMS sent to customer';
  if (actionKey === 'PRODUCT_BULK_CREATE') return 'Bulk products imported';
  if (actionKey === 'MANUFACTURING_BULK_UPLOAD') return 'Manufacturing images uploaded in bulk';
  if (actionKey === 'LEDGER_UPSERT') return 'Ledger customer saved';

  const verb = METHOD_VERBS[method] || method;
  if (subPath.includes(':id') || req.params?.id) return `${verb} ${label}`;
  return `${verb} ${label}`;
};

module.exports = {
  MODULE_LABELS,
  getModuleFromPath,
  getEntityId,
  buildActionKey,
  buildDescription,
};
