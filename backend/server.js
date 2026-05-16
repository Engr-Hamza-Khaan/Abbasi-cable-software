const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const shopRoutes = require('./routes/shopRoutes');
const logRoutes = require('./routes/logRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const auditLogger = require('./middleware/auditMiddleware');

require('./cron/reminderCron'); // Start cron jobs
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected to socket');
  socket.on('disconnect', () => {
    console.log('Client disconnected from socket');
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(auditLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/attendance', attendanceRoutes);

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('PostgreSQL Connected');
    return sequelize.sync(); // This will create tables if they don't exist
  })
  .then(() => console.log('Database Synchronized'))
  .catch((err) => console.log('PostgreSQL Connection Error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
