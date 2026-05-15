const CustomerDue = require('../models/CustomerDue');
const { sendSms } = require('../utils/smsSender');

// Get all customers dues
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerDue.findAll({
      order: [['dueDate', 'ASC']]
    });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add new customer due
exports.addCustomer = async (req, res) => {
  try {
    const { customerName, phoneNumber, dueAmount, dueDate } = req.body;
    
    if (!customerName || !phoneNumber || !dueAmount || !dueDate) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const newCustomer = await CustomerDue.create({
      customerName,
      phoneNumber,
      dueAmount,
      dueDate
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update customer due
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, phoneNumber, dueAmount, dueDate, paymentStatus } = req.body;

    const customer = await CustomerDue.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    customer.customerName = customerName || customer.customerName;
    customer.phoneNumber = phoneNumber || customer.phoneNumber;
    customer.dueAmount = dueAmount || customer.dueAmount;
    customer.dueDate = dueDate || customer.dueDate;
    if (paymentStatus) {
      customer.paymentStatus = paymentStatus;
    }

    await customer.save();

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send manual SMS
exports.sendManualSms = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Backend Debug] Controller received request to send SMS for ID: ${id}`);
    
    const customer = await CustomerDue.findByPk(id);
    
    if (!customer) {
      console.log(`[Backend Debug] Customer ID ${id} not found in DB.`);
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    console.log(`[Backend Debug] Calling sendSms utility for customer: ${customer.customerName} (${customer.phoneNumber})`);
    const result = await sendSms(
      customer.customerName,
      customer.phoneNumber,
      customer.dueAmount,
      customer.dueDate
    );

    console.log(`[Backend Debug] sendSms utility finished executing. Result:`, result);

    if (result.success) {
      customer.reminderSent = true;
      await customer.save();
      console.log(`[Backend Debug] DB updated: reminderSent = true for Customer ID: ${id}`);
      res.status(200).json({ success: true, message: 'SMS sent successfully', details: result });
    } else {
      console.log(`[Backend Debug] sendSms utility reported failure for Customer ID: ${id}`);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error(`[Backend Debug] Catch Block Error in sendManualSms:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};
