import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import sequelize from './models/index.js';
import apiRoutes from './routes/route.js';
import { seedDatabase } from './seed.js';
import { registerSocketHandlers } from './socket/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch (error) {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ShadiMatch API' });
});

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
});

registerSocketHandlers(io);

const port = Number(process.env.PORT || 5000);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await seedDatabase();

  server.listen(port, () => {
    console.log(`API running on http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error('Failed to start API server:', error.message);
  process.exit(1);
}
