const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

require('./cron/reminderCron'); // Start cron jobs
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/reminders', reminderRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
