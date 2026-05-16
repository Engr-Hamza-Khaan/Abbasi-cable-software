const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');

// Routes
router.use(protect);
router.use(resolveShop);

router.get('/customers', reminderController.getAllCustomers);
router.post('/customers', reminderController.addCustomer);
router.put('/customers/:id', reminderController.updateCustomer);
router.post('/customers/:id/send-sms', reminderController.sendManualSms);

module.exports = router;
