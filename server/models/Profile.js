import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profile = sequelize.define('Profile', {
  religion: DataTypes.STRING,
  caste: DataTypes.STRING,
  motherTongue: DataTypes.STRING,
  location: DataTypes.STRING,
  education: DataTypes.STRING,
  occupation: DataTypes.STRING,
  height: DataTypes.STRING,
  bio: DataTypes.TEXT,
  interests: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

export default Profile;
