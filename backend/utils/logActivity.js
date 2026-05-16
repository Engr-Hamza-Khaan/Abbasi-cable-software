const ActivityLog = require('../models/ActivityLog');

const SENSITIVE_KEYS = [
  'password',
  'token',
  'resetPasswordToken',
  'resetPasswordExpire',
  'authorization',
];

const sanitizeMetadata = (body) => {
  if (!body || typeof body !== 'object') return null;
  const copy = Array.isArray(body) ? [...body] : { ...body };
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach((key) => {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        scrub(obj[key]);
      }
    });
  };
  scrub(copy);
  return copy;
};

const logActivity = async ({
  userId = null,
  userRole = null,
  shopId = null,
  action,
  description,
  entityType = null,
  entityId = null,
  method = null,
  path = null,
  metadata = null,
  ipAddress = null,
  statusCode = null,
}) => {
  try {
    await ActivityLog.create({
      userId,
      userRole,
      shopId,
      action,
      description,
      entityType,
      entityId,
      method,
      path,
      metadata: sanitizeMetadata(metadata),
      ipAddress,
      statusCode,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = { logActivity, sanitizeMetadata };
