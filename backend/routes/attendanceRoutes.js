const express = require('express');
const router = express.Router();
const {
  syncAttendance,
  deviceHeartbeat,
  getAttendanceLogs,
  getAttendanceStats
} = require('../controllers/attendanceController');

// Sync and Heartbeat (Ideally these would have a separate agent auth)
router.post('/sync', syncAttendance);
router.post('/heartbeat', deviceHeartbeat);

// Data fetching
router.get('/logs', getAttendanceLogs);
router.get('/stats', getAttendanceStats);

module.exports = router;
