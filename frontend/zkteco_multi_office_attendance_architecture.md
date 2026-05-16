# Multi-Office ZKTeco Attendance Sync Architecture (MERN)

## OBJECTIVE

Build a scalable multi-office attendance management system using:

- MERN Stack
- ZKTeco iFace 800 biometric devices
- Local office sync agents
- Central cloud API
- Real-time dashboard updates

The biometric devices do NOT support reliable cloud push APIs, therefore a hybrid pull architecture must be implemented.

---

# HIGH LEVEL ARCHITECTURE

```txt
[Office Device]
      ↓ LAN
[Local Sync Agent]
      ↓ HTTPS
[Central MERN Backend]
      ↓
[MongoDB]
      ↓
[Socket.IO]
      ↓
[React Dashboard]
```

---

# SYSTEM COMPONENTS

# 1. CENTRAL CLOUD BACKEND

Technology:

```txt
Node.js
Express.js
MongoDB
Socket.IO
JWT Auth
```

Responsibilities:

- Receive attendance logs from all offices
- Store logs in MongoDB
- Prevent duplicate entries
- Manage offices/devices/users
- Broadcast live attendance updates
- Generate reports
- Track office/device online status

---

# 2. LOCAL OFFICE SYNC AGENT

Technology:

```txt
Node.js
node-zklib
axios
node-cron
SQLite (optional)
PM2
```

Responsibilities:

- Connect to local ZKTeco device via LAN
- Pull attendance logs every 5 seconds
- Detect new attendance entries
- Send logs to cloud API
- Cache unsent logs locally
- Retry failed syncs
- Send heartbeat status

Runs inside each office network.

---

# 3. REACT ADMIN DASHBOARD

Technology:

```txt
React.js
Socket.IO Client
Redux/Context
Tailwind/Material UI
```

Features:

- Live attendance feed
- Present employees
- IN/OUT status
- Late arrivals
- Employee history
- Office-wise filtering
- Device online/offline status
- Sync status monitoring

---

# DATABASE DESIGN

## COLLECTION: offices

```json
{
  "_id": "",
  "name": "Karachi Office",
  "code": "KHI-01",
  "location": "Karachi",
  "status": "online",
  "lastHeartbeat": "2026-05-16T10:00:00Z"
}
```

## COLLECTION: devices

```json
{
  "_id": "",
  "officeId": "",
  "name": "Main Entrance",
  "ip": "192.168.1.201",
  "port": 4370,
  "serialNumber": "6614151700025",
  "firmware": "Ver 8.0.0",
  "status": "online",
  "lastSync": ""
}
```

## COLLECTION: employees

```json
{
  "_id": "",
  "employeeCode": "EMP-1001",
  "deviceUserId": "12",
  "name": "Ali Khan",
  "department": "HR"
}
```

## COLLECTION: attendance_logs

```json
{
  "_id": "",
  "officeId": "",
  "deviceId": "",
  "employeeId": "",
  "deviceUserId": "12",
  "timestamp": "2026-05-16T09:00:00Z",
  "state": 0,
  "type": "IN",
  "raw": {},
  "syncSource": "agent"
}
```

---

# DUPLICATE PREVENTION

Use unique key:

```txt
deviceId + deviceUserId + timestamp
```

MongoDB index:

```javascript
attendance_logs.createIndex(
  {
    deviceId: 1,
    deviceUserId: 1,
    timestamp: 1
  },
  { unique: true }
);
```

---

# ATTENDANCE STATE MAPPING

```txt
0 = IN
1 = OUT
2 = BREAK_OUT
3 = BREAK_IN
4 = OT_IN
5 = OT_OUT
```

---

# LOCAL SYNC AGENT FLOW

## STEP 1 — CONNECT TO DEVICE

Install:

```bash
npm install node-zklib
```

Example:

```javascript
const ZKLib = require('node-zklib');

const zk = new ZKLib(
  '192.168.1.201',
  4370,
  10000,
  4000
);

await zk.createSocket();
```

---

## STEP 2 — FETCH ATTENDANCE

```javascript
const logs = await zk.getAttendances();
```

Expected format:

```json
{
  "uid": 1,
  "id": "12",
  "timestamp": "2026-05-16 09:00:00",
  "state": 0
}
```

---

## STEP 3 — FILTER ONLY NEW LOGS

Maintain:

```txt
lastPulledTimestamp
```

Only sync newer logs.

---

## STEP 4 — SEND TO CLOUD API

```javascript
await axios.post(
  'https://api.yourdomain.com/attendance/sync',
  {
    officeId,
    deviceId,
    logs
  }
);
```

---

## STEP 5 — LOCAL OFFLINE CACHE

If internet fails:

Store logs locally:

```txt
SQLite
or
JSON file
```

Retry automatically later.

---

## STEP 6 — HEARTBEAT SYSTEM

Every 30 sec:

```javascript
POST /agent/heartbeat
```

Payload:

```json
{
  "officeId": "",
  "deviceId": "",
  "status": "online",
  "lastSync": ""
}
```

---

# CENTRAL API ENDPOINTS

## Attendance Sync

```txt
POST /api/attendance/sync
```

Responsibilities:

- Validate token
- Remove duplicates
- Save logs
- Emit Socket.IO event

---

## Device Heartbeat

```txt
POST /api/agent/heartbeat
```

---

## Office Status

```txt
GET /api/offices/status
```

---

# LIVE DASHBOARD

Install:

```bash
npm install socket.io socket.io-client
```

---

# SOCKET EVENTS

## Backend Emit

```javascript
io.emit('attendance:new', attendance);
```

## Frontend Listen

```javascript
socket.on('attendance:new', data => {
   updateDashboard(data);
});
```

---

# DASHBOARD FEATURES

## LIVE FEED

```txt
Ali Khan checked IN at 09:02 AM
```

## PRESENT EMPLOYEES

Logic:

```txt
Last State = IN
```

means present.

---

## OFFICE MONITORING

```txt
Karachi Office → Online
Lahore Office → Offline
```

---

# SECURITY

## Agent Authentication

Each office agent must use:

```txt
JWT/API Key
```

---

## HTTPS REQUIRED

Cloud API must use SSL.

---

# DEVICE NETWORK CONFIGURATION

Inside device:

```txt
Menu → Comm → Ethernet
```

Set:

```txt
Static IP
```

Example:

```txt
192.168.1.201
```

Do NOT use DHCP.

---

# WINDOWS DEPLOYMENT

Install PM2:

```bash
npm install -g pm2
```

Run agent:

```bash
pm2 start sync.js
```

Auto-start:

```bash
pm2 startup
pm2 save
```

---

# RECOMMENDED PRODUCTION SETUP

## PER OFFICE

- 1 biometric device
- 1 sync PC/mini PC
- internet connection

## CENTRAL SERVER

- VPS/Cloud server
- MongoDB
- Express API
- Socket.IO
- React dashboard

---

# FUTURE SCALABILITY

System should support:

```txt
Multiple offices
Multiple devices per office
Thousands of employees
```

---

# IMPORTANT ENGINEERING NOTES

## NEVER

```txt
Clear device logs automatically
```

until successful sync confirmation exists.

## ALWAYS

```txt
Store raw device log
```

for debugging/audit purposes.

## HANDLE

```txt
Internet downtime
Device offline
Duplicate records
Power failure
```

gracefully.

---

# FINAL GOAL

The final system should behave like a modern cloud attendance platform even though the biometric devices are old LAN-based ZKTeco hardware.
