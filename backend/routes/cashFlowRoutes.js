const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const activityLogger = require('../middleware/activityLogger');
const cashTransactionController = require('../controllers/cashTransactionController');

router.use(protect, resolveShop, authorize('admin'), activityLogger);

router.get('/', cashTransactionController.getTransactions);
router.post('/', cashTransactionController.createTransaction);
router.put('/:id', cashTransactionController.updateTransaction);
router.delete('/:id', cashTransactionController.deleteTransaction);

module.exports = router;
