const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const ledgerController = require('../controllers/ledgerController');

router.use(protect, resolveShop, authorize('admin'));

router.get('/', ledgerController.getCustomers);
router.post('/', ledgerController.upsertCustomer);
router.delete('/:id', ledgerController.deleteCustomer);

module.exports = router;
