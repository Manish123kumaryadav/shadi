import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  mobile: { type: DataTypes.STRING, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
  lookingFor: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
  dob: { type: DataTypes.DATEONLY, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otpCode: DataTypes.STRING,
  otpExpiresAt: DataTypes.DATE,
  lastSeenAt: DataTypes.DATE,
});

export default User;
