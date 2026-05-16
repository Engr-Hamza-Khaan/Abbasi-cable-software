import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, UserCheck, UserX, Clock, Search, RefreshCw, Cpu, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';

const Attendance = () => {
  const { selectedShopId, shops } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    onLeave: 0,
    lateArrival: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance/logs?shopId=${selectedShopId}&date=${selectedDate}`),
        axios.get(`http://localhost:5000/api/attendance/stats?shopId=${selectedShopId}`)
      ]);

      if (logsRes.data.success) setLogs(logsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedShopId, selectedDate]);

  useEffect(() => {
    fetchAttendanceData();

    // Listen for real-time updates
    socket.on('attendance:new', (newLog) => {
      // Only update if it belongs to current shop and date
      if (newLog.shopId === selectedShopId) {
        const logDate = new Date(newLog.timestamp).toISOString().split('T')[0];
        if (logDate === selectedDate) {
          setLogs(prev => [newLog, ...prev]);
        }
        // Update stats (simple increment for demonstration)
        if (newLog.state === 0) {
          setStats(prev => ({ ...prev, presentToday: prev.presentToday + 1 }));
        }
      }
    });

    return () => {
      socket.off('attendance:new');
    };
  }, [selectedShopId, selectedDate, fetchAttendanceData]);

  const filteredLogs = logs.filter(log => 
    (log.Employee?.name || `ID: ${log.deviceUserId}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.Employee?.designation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dashboardStats = [
    { label: 'Total Staff', value: stats.totalStaff, icon: UserCheck, color: 'blue' },
    { label: 'Present Today', value: stats.presentToday, icon: Calendar, color: 'emerald' },
    { label: 'On Leave', value: stats.onLeave, icon: UserX, color: 'amber' },
    { label: 'Late Arrival', value: stats.lateArrival, icon: Clock, color: 'rose' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Attendance Management</h2>
          <p className="text-slate-500 dark:text-slate-400">
            {shops.find(s => (s.id || s._id).toString() === selectedShopId)?.name || 'Select a Shop'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAttendanceData}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Device Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                <tr key={log.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                    {log.Employee?.name || `ZKTeco User: ${log.deviceUserId}`}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {log.Employee?.designation || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      log.type === 'IN' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      log.type === 'OUT' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {log.AttendanceDevice?.name || 'Device'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {loading ? 'Loading logs...' : 'No attendance records found for this date.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
