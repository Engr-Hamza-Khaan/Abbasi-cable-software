const axios = require('axios');
const SmsLog = require('../models/SmsLog');

const sendSms = async (customerName, phoneNumber, dueAmount, dueDate) => {
  console.log(`[smsSender Debug] Started sendSms function for phone: ${phoneNumber}`);
  try {
    const message = `Dear ${customerName}, your pending dues of Rs. ${dueAmount} are due on ${dueDate}. Please clear payment to avoid interruption.`;

    // Check if gateway environment variables are defined, otherwise log and bypass (useful for testing if no API key provided)
    const TRACCAR_TOKEN = process.env.TRACCAR_TOKEN;
    console.log(`[smsSender Debug] TRACCAR_TOKEN found in environment: ${TRACCAR_TOKEN ? 'YES' : 'NO'}`);

    let success = false;
    let errorLog = '';

    if (!TRACCAR_TOKEN) {
      console.log(`[SMS Simulation] To: ${phoneNumber}, Message: ${message}`);
      success = true;
      errorLog = 'Simulated. No Gateway config found.';
    } else {
      // Call Traccar SMS API
      try {
        console.log(`[smsSender Debug] Making axios post request to Traccar API...`);
        const response = await axios.post(
          "https://www.traccar.org/sms/",
          {
            to: phoneNumber,
            message: message,
          },
          {
            headers: {
              Authorization: TRACCAR_TOKEN,
              "Content-Type": "application/json",
            },
          }
        );
        
        const responseData = response.data;
        console.log(`[SMS Gateway Raw Response]:`, typeof responseData === 'object' ? JSON.stringify(responseData) : responseData);
        
        success = true;
        console.log(`[SMS Gateway Success]: Message Sent`);
      } catch (err) {
        success = false;
        errorLog = err.response?.data ? JSON.stringify(err.response.data) : (err.message || 'SMS Gateway Error');
        console.error(`[SMS Gateway Error]:`, errorLog);
      }
    }

    console.log(`[smsSender Debug] Logging result into SmsLog database...`);
    // Save Log
    await SmsLog.create({
      customerName,
      phoneNumber,
      message,
      status: success ? 'Sent' : 'Failed',
      errorLog: errorLog
    });
    console.log(`[smsSender Debug] SmsLog database entry created successfully.`);

    return { success, message: success ? 'SMS Sent Successfully' : 'SMS Failed', error: errorLog };

  } catch (error) {
    console.error('[smsSender Debug] Fatal error in sendSms function:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSms };
