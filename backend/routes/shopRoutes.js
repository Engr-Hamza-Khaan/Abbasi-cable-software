const express = require('express');
const router = express.Router();
const {
  getShops,
  createShop,
  getShopById,
  updateShop,
} = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

// Public: signup shop selection
router.get('/', getShops);

router.post('/', protect, createShop);

router.route('/:id')
  .get(protect, getShopById)
  .put(protect, updateShop);

module.exports = router;
