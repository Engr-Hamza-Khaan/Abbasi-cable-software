const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Routes
router.get('/customers', reminderController.getAllCustomers);
router.post('/customers', reminderController.addCustomer);
router.put('/customers/:id', reminderController.updateCustomer);
router.post('/customers/:id/send-sms', reminderController.sendManualSms);

module.exports = router;
