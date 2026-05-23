const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models'); // Register associations
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const cashFlowRoutes = require('./routes/cashFlowRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const bultyRoutes = require('./routes/bultyRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const activityRoutes = require('./routes/activityRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { ensureSchema } = require('./utils/ensureSchema');
const { seedSuperAdmin } = require('./utils/seedSuperAdmin');
const activityLogger = require('./middleware/activityLogger');

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
app.use(express.json({ limit: '10mb' }));
app.use(activityLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/cash-flow', cashFlowRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/bulty', bultyRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(errorHandler);

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('PostgreSQL Connected');
    return sequelize.sync();
  })
  .then(() => ensureSchema())
  .then(() => seedSuperAdmin())
  .then(() => console.log('Database Synchronized'))
  .catch((err) => console.log('PostgreSQL Connection Error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
