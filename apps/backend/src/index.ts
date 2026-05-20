import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

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

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ──────────────────────────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

// ──────────────────────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ──────────────────────────────────────────────────────────────
// API Routes — all under /api/v1/
// ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/trips/:id/stops', stopRoutes);
app.use('/api/v1/trips/:id/stops/:stopId/activities', stopActivityRoutes);
app.use('/api/v1/trips/:id/packing', packingRoutes);
app.use('/api/v1/trips/:id/notes', noteRoutes);
app.use('/api/v1/admin', adminRoutes);

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
