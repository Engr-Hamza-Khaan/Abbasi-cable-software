const axios = require('axios');
const qs = require('qs');
const SmsLog = require('../models/SmsLog');

const sendSms = async (customerName, phoneNumber, dueAmount, dueDate) => {
  try {
    const message = `Dear ${customerName}, your pending dues of Rs. ${dueAmount} are due on ${dueDate}. Please clear payment to avoid interruption.`;

    // Check if gateway environment variables are defined, otherwise log and bypass (useful for testing if no API key provided)
    const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
    const SMS_API_KEY = process.env.SMS_API_KEY;

    let success = false;
    let errorLog = '';

    if (!SMS_GATEWAY_URL || !SMS_API_KEY) {
      console.log(`[SMS Simulation] To: ${phoneNumber}, Message: ${message}`);
      success = true;
      errorLog = 'Simulated. No Gateway config found.';
    } else {
      // Call SMS Gateway based on sendpk.com docs
      try {
        const SENDER_ID = process.env.SENDER_BRAND || process.env.SENDER_ID || 'Abbasi Cable';
        
        const data = qs.stringify({
          'api_key': SMS_API_KEY,
          'sender': SENDER_ID,
          'mobile': phoneNumber,
          'message': message,
          'format': 'json'
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: SMS_GATEWAY_URL,
          headers: { },
          data: data
        };

        const response = await axios(config);
        
        const responseData = response.data;
        
        console.log(`[SMS Gateway Raw Response]:`, typeof responseData === 'object' ? JSON.stringify(responseData) : responseData);
        
        // Handle error responses
        if (typeof responseData === 'string' && /^\d+\s*:/.test(responseData)) {
          success = false;
          errorLog = responseData;
        } else if (responseData && (responseData.success === 'false' || responseData.success === false)) {
          success = false;
          if (responseData.results && responseData.results.length > 0 && responseData.results[0].error) {
            errorLog = responseData.results[0].error;
          } else {
            errorLog = 'SMS Gateway reported failure';
          }
        } else if (responseData && responseData.status && responseData.status.toLowerCase() === 'error') {
          success = false;
          errorLog = responseData.message || 'SMS Gateway Error';
        } else {
          // If no error matched, consider it success
          success = true;
          // Store response details if needed
          if (responseData && typeof responseData === 'object' && responseData.message) {
             console.log(`[SMS Gateway Success]: ${responseData.message}`);
          } else {
             console.log(`[SMS Gateway Success]: Message Sent`);
          }
        }
      } catch (err) {
        success = false;
        errorLog = err.response && err.response.data ? JSON.stringify(err.response.data) : (err.message || 'SMS Gateway Error');
      }
    }

    // Save Log
    await SmsLog.create({
      customerName,
      phoneNumber,
      message,
      status: success ? 'Sent' : 'Failed',
      errorLog: errorLog
    });

    return { success, message: success ? 'SMS Sent Successfully' : 'SMS Failed', error: errorLog };

  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSms };
