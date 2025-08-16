import 'dotenv/config'; // must be first
import express from 'express';
import cors from 'cors';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';

const app = express();

// Connect to Cloudinary
await connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Root route - open to everyone
app.get('/', (req, res) => res.send('🚀 Server is Live!'));

// Mount AI routes (no auth for now)
app.use('/api/ai', aiRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
