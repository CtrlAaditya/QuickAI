import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { requireAuth } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';

import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Connect to Cloudinary
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all incoming requests (optional, but good for local debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Root route - open to everyone, a simple server health check
app.get('/', (req, res) => res.send('🚀 Server is Live!'));

// Protect and mount AI routes
// requireAuth() acts as middleware before the aiRoutes router
app.use('/api/ai', requireAuth(), aiRoutes);

// Protect and mount User routes
// requireAuth() acts as middleware before the userRoutes router
app.use('/api/user', requireAuth(), userRoutes);

// --- NEW: 404 Not Found Handler ---
// This middleware will catch any requests that didn't match a defined route
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next error-handling middleware
});

// --- NEW: Global Error Handler ---
// This middleware catches all errors passed via next(error) or thrown in routes
app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack, // Hide stack in production
  });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
