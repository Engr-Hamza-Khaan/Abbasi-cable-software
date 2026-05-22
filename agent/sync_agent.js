/**
 * ZKTeco Local Sync Agent
 * Run on the office PC on the same LAN as the device.
 *
 * Env (optional): DEVICE_IP, DEVICE_PORT, API_URL, SHOP_ID, DEVICE_ID, DEBUG=1
 */
const ZKLib = require('node-zklib');
const axios = require('axios');
const cron = require('node-cron');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONFIG = {
  DEVICE_IP: process.env.DEVICE_IP || '192.168.1.201',
  DEVICE_PORT: Number(process.env.DEVICE_PORT || 4370),
  API_URL: process.env.API_URL || 'http://localhost:5000/api/attendance',
  SHOP_ID: process.env.SHOP_ID || 'd01ce568-8853-49f6-91d2-f61adefe2500',
  DEVICE_ID: process.env.DEVICE_ID || '2b882a33-cacf-405e-8d70-ae8154e2ecd8',
  SYNC_INTERVAL: process.env.SYNC_INTERVAL || '*/5 * * * * *',
  HEARTBEAT_INTERVAL: process.env.HEARTBEAT_INTERVAL || '*/30 * * * * *',
  DEBUG: process.env.DEBUG !== '0',
};

let zkInstance = null;
let loggedSampleRaw = false;

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function logDebug(...args) {
  if (CONFIG.DEBUG) log('[debug]', ...args);
}

function logApiError(label, err) {
  if (err.response) {
    console.error(label, {
      status: err.response.status,
      message: err.response.data?.message || err.message,
      data: err.response.data,
    });
  } else if (err.request) {
    console.error(label, 'No response from API — is backend running?', CONFIG.API_URL);
  } else {
    console.error(label, err.message);
  }
}

function validateConfig() {
  const problems = [];
  if (!CONFIG.SHOP_ID || CONFIG.SHOP_ID.includes('YOUR_')) {
    problems.push('SHOP_ID is missing — set env SHOP_ID to your shop UUID from the dashboard');
  } else if (!UUID_RE.test(CONFIG.SHOP_ID)) {
    problems.push(`SHOP_ID is not a valid UUID: "${CONFIG.SHOP_ID}"`);
  }
  if (!CONFIG.DEVICE_ID || CONFIG.DEVICE_ID.includes('YOUR_')) {
    problems.push('DEVICE_ID is missing — set env DEVICE_ID to AttendanceDevice.id from the database');
  } else if (!UUID_RE.test(CONFIG.DEVICE_ID)) {
    problems.push(
      `DEVICE_ID must be a UUID from AttendanceDevices table, not "${CONFIG.DEVICE_ID}" (invalid UUID causes API 500)`
    );
  }
  if (problems.length) {
    console.error('Config errors:\n - ' + problems.join('\n - '));
    process.exit(1);
  }
}

/** node-zklib uses deviceUserId + recordTime; API expects id + timestamp + state */
function normalizeZkLog(raw) {
  const deviceUserId = String(
    raw.deviceUserId ?? raw.id ?? raw.userId ?? raw.userSn ?? ''
  ).trim();
  const time = raw.recordTime ?? raw.timestamp;
  const parsedTime = time instanceof Date ? time : new Date(time);
  const state = raw.state != null ? Number(raw.state) : 0;

  return {
    id: deviceUserId,
    timestamp: parsedTime.toISOString(),
    state: Number.isFinite(state) ? state : 0,
  };
}

async function connectToDevice() {
  try {
    zkInstance = new ZKLib(CONFIG.DEVICE_IP, CONFIG.DEVICE_PORT, 10000, 4000);
    await zkInstance.createSocket();
    log('Connected to ZKTeco device', `${CONFIG.DEVICE_IP}:${CONFIG.DEVICE_PORT}`);
    if (CONFIG.DEBUG) {
      try {
        const info = await zkInstance.getInfo();
        logDebug('Device info:', info);
      } catch (e) {
        logDebug('getInfo failed:', e.message);
      }
    }
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
    const result = await zkInstance.getAttendances();
    const rawLogs = result?.data || [];

    if (!rawLogs.length) {
      logDebug('No attendance logs on device');
      return;
    }

    if (!loggedSampleRaw) {
      logDebug('Sample raw log from device:', JSON.stringify(rawLogs[0], null, 2));
      loggedSampleRaw = true;
    }

    const logs = rawLogs
      .map(normalizeZkLog)
      .filter((l) => l.id && !Number.isNaN(new Date(l.timestamp).getTime()));

    const skipped = rawLogs.length - logs.length;
    if (skipped) logDebug(`Skipped ${skipped} log(s) with missing id or invalid time`);

    log(`Found ${rawLogs.length} log(s), sending ${logs.length} to API...`);
    logDebug('Normalized sample:', logs[0]);

    const response = await axios.post(
      `${CONFIG.API_URL}/sync`,
      {
        shopId: CONFIG.SHOP_ID,
        deviceId: CONFIG.DEVICE_ID,
        logs,
      },
      { timeout: 30000 }
    );

    log('Sync OK:', response.data.message, `(saved: ${response.data.count ?? '?'})`);
  } catch (e) {
    logApiError('Sync Error:', e);
    if (
      e.message?.includes('EPIPE') ||
      e.message?.includes('ECONN') ||
      e.message?.includes('TIMEOUT')
    ) {
      zkInstance = null;
    }
  }
}

async function sendHeartbeat() {
  try {
    const response = await axios.post(
      `${CONFIG.API_URL}/heartbeat`,
      {
        deviceId: CONFIG.DEVICE_ID,
        status: zkInstance ? 'online' : 'offline',
      },
      { timeout: 10000 }
    );
    logDebug('Heartbeat OK', response.data);
  } catch (e) {
    logApiError('Heartbeat Error:', e);
  }
}

validateConfig();
log('Agent config:', {
  device: `${CONFIG.DEVICE_IP}:${CONFIG.DEVICE_PORT}`,
  api: CONFIG.API_URL,
  shopId: CONFIG.SHOP_ID,
  deviceId: CONFIG.DEVICE_ID,
  debug: CONFIG.DEBUG,
});

connectToDevice().then(() => {
  cron.schedule(CONFIG.SYNC_INTERVAL, syncLogs);
  cron.schedule(CONFIG.HEARTBEAT_INTERVAL, sendHeartbeat);
  log('Agent started and scheduled.');
});
