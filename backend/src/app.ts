// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { allowedOrigins } from './config/network';

// Database
import { connectDB } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import activityRoutes from './routes/activity.routes';
import uploadRoutes from './routes/upload.routes';
import dashboardRoutes from './routes/dashboard.routes';
import settingsRoutes from './routes/settings.routes';
import paymentRoutes from './routes/payment.routes';
import shippingRoutes from './routes/shipping.routes';
import adminAuthRoutes from './routes/adminAuth.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import legacyPublicRoutes from './routes/legacyPublic.routes';

// Middleware
import { notFound, errorHandler } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// ============================================================
// CORS Configuration
// ============================================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Idempotency-Key'],
  })
);

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// ============================================================
// Logging Middleware
// ============================================================
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan(':method :status - :response-time ms'));
} else {
  app.use(morgan(':method :status :res[content-length] - :response-time ms'));
}

// ============================================================
// Compression
// ============================================================
app.use(compression());

// ============================================================
// Body Parsing Middleware
// ============================================================
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ============================================================
// Static Files (for uploaded files)
// ============================================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================
// Health Check Route
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Shree Durga Tiles API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Shree Durga Tiles API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', legacyPublicRoutes);

if (process.env.ENABLE_LEGACY_COMMERCE === 'true') {
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/shipping', shippingRoutes);
}

// ============================================================
// 404 Not Found Handler
// ============================================================
app.use(notFound);

// ============================================================
// Global Error Handler
// ============================================================
app.use(errorHandler);

// ============================================================
// Export
// ============================================================
export default app;