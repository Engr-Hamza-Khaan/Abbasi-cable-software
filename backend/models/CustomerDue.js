const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomerDue = sequelize.define('CustomerDue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid'),
    defaultValue: 'Pending',
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = CustomerDue;
