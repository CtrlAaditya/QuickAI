import 'dotenv/config'; // must be first
import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Root route - open to everyone (no auth required)
app.get('/', (req, res) => res.send('Server is Live!'));

// Protect all /api/ai routes with authentication
app.use('/api/ai', requireAuth(), aiRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
