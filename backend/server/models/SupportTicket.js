import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportTicket = sequelize.define('SupportTicket', {
  subject: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.STRING, allowNull: false, defaultValue: 'premium' },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved'),
    allowNull: false,
    defaultValue: 'open',
  },
});

export default SupportTicket;
