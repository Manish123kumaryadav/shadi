import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQLDATABASE || 'shadhiDB',
  process.env.DB_USER || process.env.MYSQLUSER || 'root',
  process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    dialect: 'mysql',
    logging: false,
  }
);

export default sequelize;
