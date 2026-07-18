import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
  status: {
    type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  startsAt: DataTypes.DATE,
  endsAt: DataTypes.DATE,
  provider: { type: DataTypes.STRING, defaultValue: 'manual' },
  providerOrderId: DataTypes.STRING,
  providerPaymentId: DataTypes.STRING,
});

export default Subscription;
