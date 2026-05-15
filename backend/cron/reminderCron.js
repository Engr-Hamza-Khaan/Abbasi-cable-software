const cron = require('node-cron');
const CustomerDue = require('../models/CustomerDue');
const { sendSms } = require('../utils/smsSender');
const { Op } = require('sequelize');

// Run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('Running scheduled job: Automatic SMS Reminders');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];

    // Find dues that are pending, due tomorrow, and reminder not sent yet
    const dueCustomers = await CustomerDue.findAll({
      where: {
        paymentStatus: 'Pending',
        dueDate: formattedTomorrow,
        reminderSent: false
      }
    });

    console.log(`Found ${dueCustomers.length} customers due tomorrow.`);

    for (const customer of dueCustomers) {
      const result = await sendSms(
        customer.customerName,
        customer.phoneNumber,
        customer.dueAmount,
        customer.dueDate
      );

      if (result.success) {
        customer.reminderSent = true;
        await customer.save();
        console.log(`Successfully sent automatic reminder to ${customer.customerName}`);
      } else {
        console.error(`Failed to send automatic reminder to ${customer.customerName}: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error in automatic SMS reminder cron job:', error);
  }
});
