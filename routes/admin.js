const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hardcoded admin credentials (for demo purposes)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // In production, use environment variables

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );
      res.json({
        success: true,
        token,
        user: { username, role: 'admin' }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/admin/verify - Verify admin token
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = { router, verifyAdmin };

