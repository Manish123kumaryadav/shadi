import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  amountInr: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' },
  status: {
    type: DataTypes.ENUM('created', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'created',
  },
  provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'manual' },
  providerOrderId: DataTypes.STRING,
  providerPaymentId: DataTypes.STRING,
  providerSignature: DataTypes.STRING,
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

export default Payment;
