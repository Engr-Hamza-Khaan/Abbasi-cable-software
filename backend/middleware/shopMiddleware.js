const resolveShop = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authorized, no user' });
  }

  if (user.role === 'employee') {
    if (!user.shopId) {
      return res.status(403).json({ message: 'Employee account is not assigned to a shop' });
    }

    req.context = {
      userId: user.id,
      role: user.role,
      shopId: user.shopId,
    };
    return next();
  }

  // Admin: optional shop filter via query only; null = all shops (super access)
  const requestedShopId = req.query.shopId || null;

  req.context = {
    userId: user.id,
    role: user.role,
    shopId: requestedShopId || null,
  };

  next();
};

module.exports = { resolveShop };
