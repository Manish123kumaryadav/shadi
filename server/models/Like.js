import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Like = sequelize.define('Like', {
  status: {
    type: DataTypes.ENUM('liked', 'passed'),
    allowNull: false,
    defaultValue: 'liked',
  },
}, {
  indexes: [{ unique: true, fields: ['fromUserId', 'toUserId'] }],
});

export default Like;
