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

const resolveShopId = (req) => {
  if (req.context?.shopId) return req.context.shopId;
  if (req.user?.shopId) return req.user.shopId;
  if (req.body?.shopId) return req.body.shopId;
  return null;
};

const activityLogger = (req, res, next) => {
  if (!shouldLogRequest(req)) return next();

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const recordLog = (body) => {
    const statusCode = res.statusCode;
    if (statusCode >= 400) return;

    const user = req.user;
    const action = buildActionKey(req);
    const description = buildDescription(req, action);
    const module = getModuleFromPath(req.baseUrl || req.originalUrl || '');
    const entityType = MODULE_LABELS[module] || module;

    logActivity({
      userId: user?.id || null,
      userRole: user?.role || null,
      shopId: resolveShopId(req),
      action,
      description,
      entityType,
      entityId: getEntityId(req, body),
      method: req.method,
      path: req.originalUrl.split('?')[0],
      metadata: req.method !== 'GET' ? req.body : { query: req.query },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      statusCode,
    });
  };

  res.json = function jsonWrapper(data) {
    recordLog(data);
    return originalJson(data);
  };

  res.send = function sendWrapper(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      recordLog(parsed);
    } catch {
      recordLog(null);
    }
    return originalSend(data);
  };

  next();
};

module.exports = activityLogger;
