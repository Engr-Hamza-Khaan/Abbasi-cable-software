import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('abbasi-cable-user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export const withShopParams = (shopParams = {}) => ({
  params: shopParams,
});

export const withShopBody = (body, shopId) => {
  if (shopId) {
    return { ...body, shopId };
  }
  return body;
};

// Products
export const fetchProducts = (shopParams) =>
  api.get('/products', withShopParams(shopParams)).then((r) => r.data.data);

export const createProduct = (data, shopId) =>
  api.post('/products', withShopBody(data, shopId)).then((r) => r.data.data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then((r) => r.data.data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then((r) => r.data);

export const bulkCreateProducts = (products, shopId) =>
  api.post('/products/bulk', withShopBody({ products }, shopId)).then((r) => r.data.data);

// Sales
export const fetchSales = (shopParams) =>
  api.get('/sales', withShopParams(shopParams)).then((r) => r.data.data);

export const createSale = (data, shopId) =>
  api.post('/sales', withShopBody(data, shopId)).then((r) => r.data);

// Purchases
export const fetchPurchases = (shopParams) =>
  api.get('/purchases', withShopParams(shopParams)).then((r) => r.data.data);

export const createPurchase = (data, shopId) =>
  api.post('/purchases', withShopBody(data, shopId)).then((r) => r.data);

// Cash flow
export const fetchCashTransactions = (shopParams) =>
  api.get('/cash-flow', withShopParams(shopParams)).then((r) => r.data.data);

export const createCashTransaction = (data, shopId) =>
  api.post('/cash-flow', withShopBody(data, shopId)).then((r) => r.data.data);

export const deleteCashTransaction = (id) =>
  api.delete(`/cash-flow/${id}`).then((r) => r.data);

// Expenses
export const fetchExpenses = (shopParams) =>
  api.get('/expenses', withShopParams(shopParams)).then((r) => r.data.data);

export const createExpense = (data, shopId) =>
  api.post('/expenses', withShopBody(data, shopId)).then((r) => r.data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);

// Ledger
export const fetchLedgerCustomers = (shopParams) =>
  api.get('/ledger', withShopParams(shopParams)).then((r) => r.data.data);

export const upsertLedgerCustomer = (data, shopId) =>
  api.post('/ledger', withShopBody(data, shopId)).then((r) => r.data.data);

// Bulty
export const fetchBulties = (shopParams) =>
  api.get('/bulty', withShopParams(shopParams)).then((r) => r.data.data);

export const createBulty = (data, shopId) =>
  api.post('/bulty', withShopBody(data, shopId)).then((r) => r.data.data);

export const updateBulty = (id, data) =>
  api.put(`/bulty/${id}`, data).then((r) => r.data.data);

export const deleteBulty = (id) =>
  api.delete(`/bulty/${id}`).then((r) => r.data);

// Manufacturing
export const fetchManufacturingImages = (shopParams) =>
  api.get('/manufacturing', withShopParams(shopParams)).then((r) => r.data.data);

export const createManufacturingImagesBulk = (images, shopId) =>
  api.post('/manufacturing/bulk', withShopBody({ images }, shopId)).then((r) => r.data.data);

export const deleteManufacturingImage = (id) =>
  api.delete(`/manufacturing/${id}`).then((r) => r.data);

export default api;
