const { AttendanceLog, AttendanceDevice, Employee, Shop } = require('../models');
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

// @desc    Sync attendance logs from agent
// @route   POST /api/attendance/sync
// @access  Private (Agent)
exports.syncAttendance = async (req, res) => {
  try {
    const { shopId, deviceId, logs } = req.body;

    if (!shopId || !deviceId || !logs || !Array.isArray(logs)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const device = await AttendanceDevice.findByPk(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const savedLogs = [];
    for (const log of logs) {
      try {
        // Find employee by deviceUserId
        const employee = await Employee.findOne({ 
          where: { deviceUserId: log.id.toString(), shopId } 
        });

        const newLog = await AttendanceLog.create({
          shopId,
          deviceId,
          employeeId: employee ? employee.id : null,
          deviceUserId: log.id.toString(),
          timestamp: new Date(log.timestamp),
          state: log.state,
          type: STATE_MAPPING[log.state] || 'UNKNOWN',
          raw: log,
          syncSource: 'agent'
        });

        savedLogs.push(newLog);

        // Emit socket event for real-time dashboard
        if (req.app.get('io')) {
          req.app.get('io').emit('attendance:new', {
            ...newLog.toJSON(),
            employeeName: employee ? employee.name : `Device ID: ${log.id}`
          });
        }
      } catch (error) {
        // Skip duplicates (unique constraint will throw error)
        if (error.name !== 'SequelizeUniqueConstraintError') {
          console.error('Error saving log:', error);
        }
      }
    }

    // Update last sync for device
    await device.update({ lastSync: new Date(), status: 'online' });

    res.status(200).json({
      success: true,
      count: savedLogs.length,
      message: 'Sync completed'
    });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Device heartbeat
// @route   POST /api/attendance/heartbeat
// @access  Private (Agent)
exports.deviceHeartbeat = async (req, res) => {
  try {
    const { deviceId, status } = req.body;
    const device = await AttendanceDevice.findByPk(deviceId);
    
    if (device) {
      await device.update({ 
        status: status || 'online',
        lastSync: new Date() 
      });
      
      // Update Shop status as well
      await Shop.update(
        { status: 'online', lastHeartbeat: new Date() },
        { where: { id: device.shopId } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
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
