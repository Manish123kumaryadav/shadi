import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Photo = sequelize.define('Photo', {
  url: { type: DataTypes.STRING(1000), allowNull: false },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Photo;
