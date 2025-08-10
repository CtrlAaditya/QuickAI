import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Clerk middleware for authentication
app.use(clerkMiddleware());

// Root route
app.get('/', (req, res) => {
    res.send("Server is Live !");
});

// Example of a protected route using requireAuth
app.get('/protected', requireAuth(), (req, res) => {
    res.send("You have accessed a protected route!");
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
