const { ActivityLog } = require('../models');

const auditLogger = async (req, res, next) => {
  // Only log state-changing requests or important reads if needed
  // For now, let's log POST, PUT, DELETE
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const originalSend = res.send;
    
    // We can't easily get the response body after it's sent without wrapping res.send
    // But for audit logs, often just knowing the request was made is enough
    // Or we can log the request body
    
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user ? req.user.id : null;
          const shopId = req.user ? req.user.shopId : null;
          
          let resource = req.baseUrl.split('/').pop();
          let action = '';
          
          switch (req.method) {
            case 'POST': action = 'CREATE'; break;
            case 'PUT': action = 'UPDATE'; break;
            case 'DELETE': action = 'DELETE'; break;
          }

          await ActivityLog.create({
            userId,
            shopId,
            action,
            resource,
            resourceId: req.params.id || null,
            details: {
              path: req.originalUrl,
              body: req.body,
              query: req.query,
              statusCode: res.statusCode
            },
            ipAddress: req.ip
          });
        } catch (error) {
          console.error('Audit Log Error:', error);
        }
      }
    });
  }
  
  next();
};

module.exports = auditLogger;
