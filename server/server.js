import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { requireAuth } from '@clerk/express';

import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Protect routes with Clerk authentication
app.use('/api/ai', requireAuth(), aiRoutes);
app.use('/api/user', requireAuth(), userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
