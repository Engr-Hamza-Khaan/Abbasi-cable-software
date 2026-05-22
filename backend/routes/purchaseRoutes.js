const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const purchaseController = require('../controllers/purchaseController');

router.use(protect, resolveShop);

router.get('/', purchaseController.getPurchases);
router.post('/', purchaseController.createPurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
