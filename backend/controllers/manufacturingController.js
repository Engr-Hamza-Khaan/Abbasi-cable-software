const { ManufacturingImage } = require('../models');
const { buildShopWhere } = require('../utils/shopQuery');
const { resolveWriteShopId } = require('../utils/resolveWriteShopId');
const { formatManufacturingImage } = require('../utils/formatters');
const asyncHandler = require('../utils/asyncHandler');

const MAX_BASE64_LENGTH = 3 * 1024 * 1024; // ~2MB file as base64

exports.getImages = asyncHandler(async (req, res) => {
  const images = await ManufacturingImage.findAll({
    where: buildShopWhere(req.context),
    order: [['uploadedAt', 'DESC']],
    attributes: ['id', 'name', 'base64', 'uploadedAt', 'shopId'],
  });
  res.json({ success: true, data: images.map(formatManufacturingImage) });
});

exports.createImage = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { name, base64 } = req.body;

  if (!name || !base64) {
    res.status(400);
    throw new Error('name and base64 are required');
  }
  if (base64.length > MAX_BASE64_LENGTH) {
    res.status(400);
    throw new Error('Image too large. Maximum size is 2MB.');
  }

  const image = await ManufacturingImage.create({ shopId, name, base64 });
  res.status(201).json({ success: true, data: formatManufacturingImage(image) });
});

exports.createImagesBulk = asyncHandler(async (req, res) => {
  const shopId = resolveWriteShopId(req.context, req.body.shopId);
  const { images } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    res.status(400);
    throw new Error('images array is required');
  }

  const created = [];
  for (const img of images) {
    if (!img.name || !img.base64) continue;
    if (img.base64.length > MAX_BASE64_LENGTH) continue;
    const record = await ManufacturingImage.create({
      shopId,
      name: img.name,
      base64: img.base64,
    });
    created.push(formatManufacturingImage(record));
  }

  res.status(201).json({ success: true, data: created });
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const image = await ManufacturingImage.findOne({
    where: buildShopWhere(req.context, { id: req.params.id }),
  });
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }
  await image.destroy();
  res.json({ success: true, message: 'Image deleted' });
});
