const { AttendanceLog, AttendanceDevice, Employee } = require('../models');
const { Op } = require('sequelize');

// Map ZKTeco states to readable types
const STATE_MAPPING = {
  0: 'IN',
  1: 'OUT',
  2: 'BREAK_OUT',
  3: 'BREAK_IN',
  4: 'OT_IN',
  5: 'OT_OUT',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeIncomingLog(log) {
  const deviceUserId = String(
    log.deviceUserId ?? log.id ?? log.userId ?? log.userSn ?? ''
  ).trim();
  const time = log.recordTime ?? log.timestamp;
  const timestamp = time instanceof Date ? time : new Date(time);
  const state = log.state != null ? Number(log.state) : 0;

  return { deviceUserId, timestamp, state };
}

function buildRawPayload(log, deviceUserId, state, timestamp) {
  return {
    id: deviceUserId,
    state: log.state ?? state,
    timestamp: log.timestamp ?? timestamp.toISOString(),
    ...(log.verifyType != null ? { verifyType: log.verifyType } : {}),
    employeeName: String(log.employeeName ?? '').trim(),
  };
}

function isDuplicateError(error) {
  return (
    error.name === 'SequelizeUniqueConstraintError' ||
    error.parent?.code === '23505'
  );
}

async function ensureEmployeeForLog(shopId, deviceUserId, employeeName) {
  const name = String(employeeName ?? '').trim();
  let employee = await Employee.findOne({ where: { deviceUserId } });

  if (!employee) {
    return Employee.create({
      shopId,
      deviceUserId,
      name: name || `User ${deviceUserId}`,
      employeeCode: `ZK-${String(shopId).slice(0, 8)}-${deviceUserId}`,
      status: 'active',
    });
  }

  const updates = {};
  if (name && employee.name !== name) updates.name = name;
  if (!employee.shopId && shopId) updates.shopId = shopId;
  if (Object.keys(updates).length) {
    await employee.update(updates);
  }

  return employee;
}

async function loadLogForSocket(logId) {
  return AttendanceLog.findByPk(logId, {
    include: [
      { model: Employee, attributes: ['name'] },
      { model: AttendanceDevice, attributes: ['name'] },
    ],
  });
}

function emitAttendanceEvent(io, record) {
  if (!io || !record) return;
  const row = record.toJSON();
  row.employeeName =
    row.raw?.employeeName || row.Employee?.name || `Device ID: ${row.deviceUserId}`;
  io.emit('attendance:new', row);
}

// @desc    Sync attendance logs from agent
// @route   POST /api/attendance/sync
// @access  Private (Agent)
exports.syncAttendance = async (req, res) => {
  try {
    const { shopId, deviceId, logs } = req.body;

    if (!shopId || !deviceId || !logs || !Array.isArray(logs)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    if (!UUID_RE.test(String(deviceId)) || !UUID_RE.test(String(shopId))) {
      return res.status(400).json({
        success: false,
        message: 'shopId and deviceId must be valid UUIDs (use AttendanceDevice.id from the database)',
      });
    }

    const device = await AttendanceDevice.findByPk(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const io = req.app.get('io');
    const savedLogs = [];
    let updatedDuplicates = 0;

    for (const log of logs) {
      const { deviceUserId, timestamp, state } = normalizeIncomingLog(log);
      if (!deviceUserId || Number.isNaN(timestamp.getTime())) {
        continue;
      }

      const rawPayload = buildRawPayload(log, deviceUserId, state, timestamp);

      try {
        const employee = await ensureEmployeeForLog(
          shopId,
          deviceUserId,
          rawPayload.employeeName
        );

        const newLog = await AttendanceLog.create({
          shopId,
          deviceId,
          employeeId: employee ? employee.id : null,
          deviceUserId,
          timestamp,
          state,
          type: STATE_MAPPING[state] || 'UNKNOWN',
          raw: rawPayload,
          syncSource: 'agent',
        });

        savedLogs.push(newLog);
        const fullLog = await loadLogForSocket(newLog.id);
        emitAttendanceEvent(io, fullLog);
      } catch (error) {
        if (isDuplicateError(error)) {
          if (rawPayload.employeeName) {
            const existing = await AttendanceLog.findOne({
              where: { deviceId, deviceUserId, timestamp },
            });
            if (existing) {
              await existing.update({ raw: rawPayload });
              updatedDuplicates++;
            }
          }
          continue;
        }

        console.error('[attendance/sync] save failed:', error.message, {
          errors: error.errors?.map((e) => e.message),
          deviceUserId,
          timestamp: log.timestamp,
        });
      }
    }

    await device.update({ lastSync: new Date(), status: 'online' });

    if (io && (savedLogs.length > 0 || updatedDuplicates > 0)) {
      io.emit('attendance:refresh', { shopId });
    }

    res.status(200).json({
      success: true,
      count: savedLogs.length,
      message: 'Sync completed'
    });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server Error',
    });
  }
};

// @desc    Device heartbeat
// @route   POST /api/attendance/heartbeat
// @access  Private (Agent)
exports.deviceHeartbeat = async (req, res) => {
  try {
    const { deviceId, status } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'deviceId is required' });
    }
    if (!UUID_RE.test(String(deviceId))) {
      return res.status(400).json({
        success: false,
        message: 'deviceId must be a valid UUID',
      });
    }

    const device = await AttendanceDevice.findByPk(deviceId);

    if (device) {
      await device.update({
        status: status || 'online',
        lastSync: new Date(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Heartbeat Error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server Error',
    });
  }
};

// @desc    Get attendance logs
// @route   GET /api/attendance/logs
// @access  Private
exports.getAttendanceLogs = async (req, res) => {
  try {
    const { shopId, date, employeeId } = req.query;
    const where = {};

    if (shopId) where.shopId = shopId;
    if (employeeId) where.employeeId = employeeId;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.timestamp = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }

    const logs = await AttendanceLog.findAll({
      where,
      include: [
        { model: Employee, attributes: ['name', 'designation'] },
        { model: AttendanceDevice, attributes: ['name'] }
      ],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const { shopId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      timestamp: { [Op.gte]: today }
    };
    if (shopId) where.shopId = shopId;

    // This is a simplified version of stats
    const totalStaff = await Employee.count({ where: { status: 'active', ...(shopId && { shopId }) } });
    const presentToday = await AttendanceLog.count({
      where: { ...where, state: 0 },
      distinct: true,
      col: 'employeeId'
    });

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        presentToday,
        onLeave: 0, // Placeholder
        lateArrival: 0 // Placeholder
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
