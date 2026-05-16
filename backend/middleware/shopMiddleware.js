const resolveShop = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authorized, no user' });
  }

  req.context = {
    userId: user.id,
    role: user.role,
    shopId: user.role === 'admin'
      ? req.query.shopId || null
      : user.shopId
  };

  next();
};

module.exports = { resolveShop };
