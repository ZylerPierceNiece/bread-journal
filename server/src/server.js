import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import breadsRouter from './routes/breads.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import feedRouter from './routes/feed.js';
import likesRouter from './routes/likes.js';
import commentsRouter from './routes/comments.js';
import messagesRouter from './routes/messages.js';
import { initializeDatabase } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
await initializeDatabase();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/breads', likesRouter);
app.use('/api/breads', commentsRouter);
app.use('/api/breads', breadsRouter);
app.use('/api/feed', feedRouter);
app.use('/api/messages', messagesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bread Journal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${join(__dirname, 'uploads')}`);
});
