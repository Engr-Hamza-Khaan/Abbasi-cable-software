/**
 * ZKTeco Local Sync Agent
 * Run this on the local office PC connected to the ZKTeco device LAN.
 */
const ZKLib = require('node-zklib');
const axios = require('axios');
const cron = require('node-cron');

// CONFIGURATION
const CONFIG = {
  DEVICE_IP: '192.168.1.201',
  DEVICE_PORT: 4370,
  API_URL: 'http://your-cloud-api.com/api/attendance',
  SHOP_ID: 'YOUR_SHOP_ID_HERE',
  DEVICE_ID: 'YOUR_DEVICE_ID_HERE',
  SYNC_INTERVAL: '*/5 * * * * *', // Every 5 seconds
  HEARTBEAT_INTERVAL: '*/30 * * * * *', // Every 30 seconds
};

let zkInstance = null;

async function connectToDevice() {
  try {
    zkInstance = new ZKLib(CONFIG.DEVICE_IP, CONFIG.DEVICE_PORT, 10000, 4000);
    await zkInstance.createSocket();
    console.log('Connected to ZKTeco Device');
  } catch (e) {
    console.error('Connection Error:', e.message);
    zkInstance = null;
  }
}

async function syncLogs() {
  if (!zkInstance) {
    await connectToDevice();
    return;
  }

  try {
    const logs = await zkInstance.getAttendances();
    if (logs && logs.data && logs.data.length > 0) {
      console.log(`Found ${logs.data.length} logs. Sending to cloud...`);
      
      const response = await axios.post(`${CONFIG.API_URL}/sync`, {
        shopId: CONFIG.SHOP_ID,
        deviceId: CONFIG.DEVICE_ID,
        logs: logs.data
      });

      console.log('Sync result:', response.data.message);
      
      // OPTIONAL: You can clear logs on device after successful sync
      // await zkInstance.clearAttendanceLog(); 
    }
  } catch (e) {
    console.error('Sync Error:', e.message);
    if (e.message.includes('EPIPE') || e.message.includes('ECONN')) {
      zkInstance = null; // Reset for reconnect
    }
  }
}

async function sendHeartbeat() {
  try {
    await axios.post(`${CONFIG.API_URL}/heartbeat`, {
      deviceId: CONFIG.DEVICE_ID,
      status: zkInstance ? 'online' : 'offline'
    });
  } catch (e) {
    console.error('Heartbeat Error:', e.message);
  }
}

// Start
connectToDevice().then(() => {
  cron.schedule(CONFIG.SYNC_INTERVAL, syncLogs);
  cron.schedule(CONFIG.HEARTBEAT_INTERVAL, sendHeartbeat);
  console.log('Agent started and scheduled.');
});
