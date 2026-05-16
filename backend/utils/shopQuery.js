/**
 * Build Sequelize where clause for shop-scoped queries.
 * - Employee: always restricted to their assigned shop
 * - Admin: filtered only when shopId is set in context; otherwise all shops
 */
const buildShopWhere = (context, baseWhere = {}) => {
  if (context.role === 'employee') {
    return { ...baseWhere, shopId: context.shopId };
  }

  if (context.shopId) {
    return { ...baseWhere, shopId: context.shopId };
  }

  return { ...baseWhere };
};

module.exports = { buildShopWhere };
