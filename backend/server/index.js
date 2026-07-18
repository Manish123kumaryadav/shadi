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
let databaseReady = false;
let databaseError = null;
const allowedOrigins = (process.env.CLIENT_URL || 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return true;
    if (url.hostname.endsWith('.vercel.app')) return true;
    return false;
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
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ShadiMatch API',
    databaseReady,
    databaseError,
  });
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'ShadiMatch API',
    databaseReady,
    databaseError,
  });
});

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
});

registerSocketHandlers(io);

const port = Number(process.env.PORT || 5000);

server.listen(port, () => {
  console.log(`API running on port ${port}`);
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();

    // Only create/update tables in local development
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      await seedDatabase();
    }

    databaseReady = true;
    databaseError = null;
    console.log('Database connected');
  } catch (error) {
    databaseReady = false;
    databaseError = error.message;
    console.error('Database initialization failed:', error.message);
  }
}

initializeDatabase();

initializeDatabase();
