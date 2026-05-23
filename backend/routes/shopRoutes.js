const express = require('express');
const router = express.Router();
const {
  getShops,
  createShop,
  getShopById,
  updateShop,
  deleteShop,
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public: signup shop selection
router.get('/', getShops);

router.post('/', protect, authorize('super-admin'), createShop);

router.route('/:id')
  .get(protect, getShopById)
  .put(protect, authorize('super-admin'), updateShop)
  .delete(protect, authorize('super-admin'), deleteShop);

module.exports = router;
