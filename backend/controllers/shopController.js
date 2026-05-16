const { Shop } = require('../models');

const getShops = async (req, res) => {
  try {
    const shops = await Shop.findAll();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (shop) {
      await shop.update(req.body);
      res.json(shop);
    } else res.status(404).json({ message: 'Shop not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShops, createShop, getShopById, updateShop };
