const { logActivity } = require('../utils/logActivity');
const {
  MODULE_LABELS,
  getModuleFromPath,
  getEntityId,
  buildActionKey,
  buildDescription,
} = require('../utils/activityDescriptions');

const SKIP_PATH_PREFIXES = ['/api/activity-logs'];

const shouldLogRequest = (req) => {
  const path = req.originalUrl.split('?')[0];
  if (SKIP_PATH_PREFIXES.some((p) => path.startsWith(p))) return false;
  if (req.method === 'OPTIONS') return false;
  return true;
};

const resolveShopId = (req, responseBody) => {
  if (req.context?.shopId) return req.context.shopId;
  if (req.user?.shopId) return req.user.shopId;
  if (responseBody?.shopId) return responseBody.shopId;
  if (req.body?.shopId) return req.body.shopId;
  return null;
};

const resolveUserFromRequest = (req, responseBody) => {
  if (req.user) {
    return { userId: req.user.id, userRole: req.user.role };
  }
  const path = req.originalUrl.split('?')[0];
  if (responseBody?.id && (path.includes('/login') || path.includes('/register'))) {
    return { userId: responseBody.id, userRole: responseBody.role || null };
  }
  return { userId: null, userRole: null };
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
  let logged = false;

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

  res.on('finish', () => {
    if (logged || res.statusCode >= 400) return;
    logged = true;

    const responseBody = captured.body;
    const { userId, userRole } = resolveUserFromRequest(req, responseBody);
    const action = buildActionKey(req);
    const description = buildDescription(req, action);
    const module = getModuleFromPath(req.baseUrl || req.originalUrl || '');
    const entityType = MODULE_LABELS[module] || module;

    logActivity({
      userId,
      userRole,
      shopId: resolveShopId(req, responseBody),
      action,
      description,
      entityType,
      entityId: getEntityId(req, responseBody),
      method: req.method,
      path: req.originalUrl.split('?')[0],
      metadata: req.method !== 'GET' ? req.body : { query: req.query },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      statusCode: res.statusCode,
    });
  });

  next();
};

module.exports = activityLogger;
