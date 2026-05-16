const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const saleController = require('../controllers/saleController');

router.use(protect, resolveShop);

router.get('/', saleController.getSales);
router.post('/', saleController.createSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
