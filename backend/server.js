require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectMongo = require('./config/mongodb');
const { testPgConnection } = require('./config/postgres');

const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/queries');
const authRoutes = require('./routes/auth');
const hintRoutes = require('./routes/hints');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect databases
connectMongo();
testPgConnection();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// Rate limiter for query execution - prevents abuse
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many query requests. Please wait a moment.' },
});

// Rate limiter for hint requests
const hintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many hint requests. Please wait a moment.' },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryLimiter, queryRoutes);
app.use('/api/hint', hintLimiter, hintRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CipherSQLStudio backend running on port ${PORT}`);
});
