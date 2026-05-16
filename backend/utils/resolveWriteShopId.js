/**
 * Resolve shopId for create/update operations.
 * Employees always use their assigned shop.
 * Admins must pass shopId in body or have a shop filter in context.
 */
const resolveWriteShopId = (context, bodyShopId) => {
  if (context.role === 'employee') {
    if (!context.shopId) {
      const err = new Error('Employee account is not assigned to a shop');
      err.statusCode = 403;
      throw err;
    }
    return context.shopId;
  }

  const shopId = bodyShopId || context.shopId;
  if (!shopId) {
    const err = new Error('shopId is required when managing data across all shops');
    err.statusCode = 400;
    throw err;
  }
  return shopId;
};

module.exports = { resolveWriteShopId };
