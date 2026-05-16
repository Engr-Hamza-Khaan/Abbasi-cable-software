const Shop = require('../models/Shop');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public (Used for signup selection)
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
// @access  Private/Admin
const createShop = async (req, res) => {
  const { name, location, phone } = req.body;

  try {
    const shop = await Shop.create({ name, location, phone });
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getShops, createShop };
