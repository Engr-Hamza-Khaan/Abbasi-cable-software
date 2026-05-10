const express = require('express');
const router = express.Router();
const { getShops, createShop, getShopById, updateShop } = require('../controllers/shopController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getShops)
  .post(protect, admin, createShop);

router.route('/:id')
  .get(protect, getShopById)
  .put(protect, admin, updateShop);

module.exports = router;
