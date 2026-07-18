import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PremiumPlan = sequelize.define('PremiumPlan', {
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.STRING,
  priceInr: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  durationDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
  features: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export default PremiumPlan;
