import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './db/prisma';
import { errorHandler } from './middleware/errorHandler';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import publicRoutes from './routes/public.routes';
import cityRoutes from './routes/city.routes';
import stopRoutes from './routes/stop.routes';
import stopActivityRoutes from './routes/stopActivity.routes';
import packingRoutes from './routes/packing.routes';
import noteRoutes from './routes/note.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';
import friendRoutes from './routes/friend.routes';
import expenseRoutes from './routes/expense.routes';
import invoiceRoutes from './routes/invoice.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ──────────────────────────────────────────────────────────────
// Global Middleware & Security Layers
// ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(sanitizeInput);

// Response time header middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalWriteHead = res.writeHead;
  
  res.writeHead = function (statusCode: any, ...args: any[]) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    return (originalWriteHead as any).apply(this, [statusCode, ...args]);
  };
  
  next();
});

// ──────────────────────────────────────────────────────────────
// Health check (No rate limits for internal health checks)
// ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

// ──────────────────────────────────────────────────────────────
// API Routes — all under /api/v1/
// ──────────────────────────────────────────────────────────────
// Apply auth rate limiter for auth routes
app.use('/api/v1/auth', authLimiter, authRoutes);

// Apply api rate limiter to all other api endpoints
app.use('/api/v1', apiLimiter);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/trips/:id/stops', stopRoutes);
app.use('/api/v1/trips/:id/stops/:stopId/activities', stopActivityRoutes);
app.use('/api/v1/trips/:id/packing', packingRoutes);
app.use('/api/v1/trips/:id/notes', noteRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/trips/:id/expenses', expenseRoutes);
app.use('/api/v1/trips/:id/invoice', invoiceRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ──────────────────────────────────────────────────────────────
// Global Error Handler (must be last middleware)
// ──────────────────────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Traveloop API server running on http://localhost:${PORT}`);
  console.log(`📍 API base: http://localhost:${PORT}/api/v1/`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/v1/health\n`);
});

export default app;
