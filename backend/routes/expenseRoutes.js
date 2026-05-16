const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const activityLogger = require('../middleware/activityLogger');
const expenseController = require('../controllers/expenseController');

router.use(protect, resolveShop, activityLogger);

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
