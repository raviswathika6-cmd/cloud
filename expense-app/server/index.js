const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payments');
const summaryRoutes = require('./routes/summaries');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies (except for webhooks)
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Store raw body for webhook verification
app.use((req, res, next) => {
  req.rawBody = Buffer.alloc(0);
  req.on('data', chunk => {
    req.rawBody = Buffer.concat([req.rawBody, chunk]);
  });
  req.on('end', () => {
    next();
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
  
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
