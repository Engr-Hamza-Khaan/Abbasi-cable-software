const { Shop } = require('../models');

// @desc    Get all active shops (public for signup)
// @route   GET /api/shops
const getShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({ where: { isActive: true } });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a shop
// @route   POST /api/shops
const createShop = async (req, res) => {
  const { name, location, phone } = req.body;

  try {
    const shop = await Shop.create({ name, location, phone });
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (shop) res.json(shop);
    else res.status(404).json({ message: 'Shop not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateShop = async (req, res) => {
  const { name, location, phone } = req.body;

  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop || !shop.isActive) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (name !== undefined) shop.name = name;
    if (location !== undefined) shop.location = location;
    if (phone !== undefined) shop.phone = phone;

    await shop.save();
    res.json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Soft-delete a shop
// @route   DELETE /api/shops/:id
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop || !shop.isActive) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    shop.isActive = false;
    await shop.save();

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShops, createShop, getShopById, updateShop, deleteShop };
