const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

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

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get all orders for calculations
    const allOrders = await Order.find({}).sort({ createdAt: -1 });

    // Today's paid orders
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate <= todayEnd && order.paymentStatus === 'Paid';
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Yesterday's paid orders
    const yesterdayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= yesterday && orderDate < today && order.paymentStatus === 'Paid';
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : (todayRevenue > 0 ? 100 : 0);
    const ordersChange = yesterdayOrders.length > 0
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
      : (todayOrders.length > 0 ? 100 : 0);

    // Pending orders (not delivered or cancelled)
    const pendingOrders = allOrders.filter(order => {
      const status = order.orderStatus || 'Placed';
      return status !== 'Delivered' && status !== 'Cancelled';
    }).length;

    // Get menu items for stock check
    const menuItems = await Menu.find({});
    const lowStockItems = menuItems.filter(item => {
      const stock = item.stock !== undefined ? item.stock : 100;
      const minStock = item.minStock !== undefined ? item.minStock : 10;
      // Low stock: stock is less than minStock but greater than 0 (out of stock is separate)
      return stock < minStock && stock > 0;
    }).length;
    
    console.log(`📦 Low stock check: ${lowStockItems} items with stock < minStock (out of ${menuItems.length} total)`);

    // Recent orders (last 5)
    const recentOrders = allOrders
      .slice(0, 5)
      .map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus || 'Placed',
        createdAt: order.createdAt,
        tokenNumber: order.tokenNumber,
      }));

    const dashboardData = {
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      lowStockItems,
      totalMenuItems: menuItems.length,
      revenueChange: parseFloat(revenueChange),
      ordersChange: parseFloat(ordersChange),
      recentOrders,
    };
    
    console.log('📊 Dashboard Stats Response:', {
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      lowStockItems,
      revenueChange: parseFloat(revenueChange),
      ordersChange: parseFloat(ordersChange),
      recentOrdersCount: recentOrders.length
    });
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

module.exports = { router, verifyAdmin };

