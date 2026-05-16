/** Main branch is the shop whose name contains "Main Branch", else first shop in list. */
export const getMainBranchShop = (shops = []) =>
  shops.find((s) => /main\s*branch/i.test(s.name)) || shops[0] || null;

export const getMainBranchShopId = (shops = []) => getMainBranchShop(shops)?.id ?? null;

export const resolveAdminShopId = (shops, storedShopId) => {
  if (!storedShopId || storedShopId === 'all') {
    return getMainBranchShopId(shops);
  }
  const exists = shops.some((s) => s.id === storedShopId);
  return exists ? storedShopId : getMainBranchShopId(shops);
};
