import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  body: { type: DataTypes.TEXT, allowNull: false },
  readAt: DataTypes.DATE,
});

export default Message;
