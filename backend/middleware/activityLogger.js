const { logActivity } = require('../utils/logActivity');
const {
  MODULE_LABELS,
  getModuleFromPath,
  getEntityId,
  buildActionKey,
  buildDescription,
} = require('../utils/activityDescriptions');

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SKIP_PATH_PREFIXES = [
  '/api/activity-logs',
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/forgotpassword',
  '/api/auth/resetpassword',
];

const shouldLogRequest = (req) => {
  const path = req.originalUrl.split('?')[0];
  if (!path.startsWith('/api/')) return false;
  if (!MUTATING_METHODS.has(req.method)) return false;
  if (req.method === 'OPTIONS') return false;
  if (SKIP_PATH_PREFIXES.some((p) => path.startsWith(p))) return false;
  return true;
};

const resolveShopId = (req, responseBody) => {
  if (req.context?.shopId) return req.context.shopId;
  if (req.user?.shopId) return req.user.shopId;
  const data = responseBody?.data ?? responseBody;
  if (data?.shopId) return data.shopId;
  if (req.body?.shopId) return req.body.shopId;
  return null;
};

const resolveUserFromRequest = (req, responseBody) => {
  if (req.user) {
    return { userId: req.user.id, userRole: req.user.role };
  }
  const path = req.originalUrl.split('?')[0];
  if (responseBody?.id && path.includes('/register')) {
    return { userId: responseBody.id, userRole: responseBody.role || null };
  }
  return { userId: null, userRole: null };
};

const buildMetadata = (req) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const summary = {};
  if (body.name) summary.name = String(body.name).slice(0, 120);
  if (body.customerName) summary.customerName = String(body.customerName).slice(0, 120);
  if (body.customer) summary.customer = String(body.customer).slice(0, 120);

  return Object.keys(summary).length ? summary : null;
};

const captureResponseBody = (target, value) => {
  if (typeof value === 'string') {
    try {
      target.body = JSON.parse(value);
    } catch {
      target.body = null;
    }
    return;
  }
  target.body = value;
};

const activityLogger = (req, res, next) => {
  if (!shouldLogRequest(req)) return next();

  const captured = { body: null };

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function jsonWrapper(data) {
    captureResponseBody(captured, data);
    return originalJson(data);
  };

  res.send = function sendWrapper(data) {
    if (captured.body === null) captureResponseBody(captured, data);
    return originalSend(data);
  };

  res.once('finish', () => {
    if (res.statusCode >= 400) return;

    const responseBody = captured.body;
    const { userId, userRole } = resolveUserFromRequest(req, responseBody);
    const path = req.originalUrl.split('?')[0];

    if (req.user?.role === 'super-admin' || userRole === 'super-admin') return;
    if (!userId && !path.includes('/register')) return;

    const action = buildActionKey(req);
    const description = buildDescription(req, action);
    const module = getModuleFromPath(req.baseUrl || req.originalUrl || '');
    const entityType = MODULE_LABELS[module] || module;

    setImmediate(() => {
      logActivity({
        userId,
        userRole,
        shopId: resolveShopId(req, responseBody),
        action,
        description,
        entityType,
        entityId: getEntityId(req, responseBody),
        method: req.method,
        path,
        metadata: buildMetadata(req),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
        statusCode: res.statusCode,
      });
    });
  });

  next();
};

module.exports = activityLogger;
