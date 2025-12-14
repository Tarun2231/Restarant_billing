const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/menu', require('./routes/menu'));
app.use('/api/order', require('./routes/order'));
app.use('/api/payment', require('./routes/payment'));
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes.router);

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Restaurant Ordering System API',
    version: '1.0.0',
    endpoints: {
      menu: '/api/menu',
      orders: '/api/order',
      payment: '/api/payment',
      admin: '/api/admin',
      health: '/api/health'
    },
    note: 'This is the backend API. Access the frontend at http://localhost:3000'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

