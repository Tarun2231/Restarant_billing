const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/order - Create new order
router.post('/', async (req, res) => {
  try {
    const { items, paymentMethod, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Generate unique order number
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${timestamp}-${String(orderCount + 1).padStart(4, '0')}-${randomSuffix}`;

    const order = new Order({
      orderNumber,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid'
    });

    await order.save();
    await order.populate('items.itemId');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/order/:orderId - Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.itemId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/order - Get all orders (Admin)
router.get('/', async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    if (status) {
      query.paymentStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.itemId')
      .limit(100);
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/order/:orderId/receipt - Mark receipt as printed
router.put('/:orderId/receipt', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { receiptPrinted: true },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

