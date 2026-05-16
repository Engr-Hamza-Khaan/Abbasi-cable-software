const { Op } = require('sequelize');
const { Product, ProductVariant } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatProduct } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

const includeVariants = { model: ProductVariant, as: 'variants' };

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: buildShopWhere(req.context),
    include: [includeVariants],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: products.map(formatProduct) });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { name, unit, minStock, color, variants = [] } = req.body;

  const product = await Product.create({
    shopId,
    name,
    unit: unit || 'meter',
    minStock: minStock || 0,
    color: color || 'Red',
  });

  if (variants.length > 0) {
    await ProductVariant.bulkCreate(
      variants.map((v) => ({
        productId: product.id,
        label: v.label || 'Default Batch',
        size: v.size,
        type: v.type,
        core: v.core,
        stock: v.stock || 0,
        unitPrice: v.unitPrice || 0,
        date: v.date,
      }))
    );
  }

  const full = await Product.findByPk(product.id, { include: [includeVariants] });
  res.status(201).json({ success: true, data: formatProduct(full) });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
    include: [includeVariants],
  });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  const { name, unit, minStock, color, variants } = req.body;
  if (name !== undefined) product.name = name;
  if (unit !== undefined) product.unit = unit;
  if (minStock !== undefined) product.minStock = minStock;
  if (color !== undefined) product.color = color;
  await product.save();

  if (Array.isArray(variants)) {
    await ProductVariant.destroy({ where: { productId: product.id } });
    if (variants.length > 0) {
      await ProductVariant.bulkCreate(
        variants.map((v) => ({
          productId: product.id,
          label: v.label || 'Default Batch',
          size: v.size,
          type: v.type,
          core: v.core,
          stock: v.stock || 0,
          unitPrice: v.unitPrice || 0,
          date: v.date,
        }))
      );
    }
  }

  const full = await Product.findByPk(product.id, { include: [includeVariants] });
  res.json({ success: true, data: formatProduct(full) });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }
  await product.destroy();
  res.json({ success: true, message: 'Product deleted' });
});

exports.bulkCreateProducts = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    throw Object.assign(new Error('products array is required'), { statusCode: 400 });
  }

  const created = [];
  for (const p of products) {
    const product = await Product.create({
      shopId,
      name: p.name,
      unit: p.unit || 'meter',
      minStock: p.minStock || 0,
      color: p.color || 'Red',
    });
    if (p.variants?.length) {
      await ProductVariant.bulkCreate(
        p.variants.map((v) => ({
          productId: product.id,
          label: v.label || 'Default Batch',
          size: v.size,
          type: v.type,
          core: v.core,
          stock: v.stock || 0,
          unitPrice: v.unitPrice || 0,
          date: v.date,
        }))
      );
    }
    const full = await Product.findByPk(product.id, { include: [includeVariants] });
    created.push(formatProduct(full));
  }
  res.status(201).json({ success: true, data: created });
});
