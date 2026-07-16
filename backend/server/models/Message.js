import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  body: { type: DataTypes.TEXT, allowNull: false },
  readAt: DataTypes.DATE,
  replyToMessageId: DataTypes.INTEGER,
  forwardedFromMessageId: DataTypes.INTEGER,
  deletedForEveryone: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  reactions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
});

export default Message;
