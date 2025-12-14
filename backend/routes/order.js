const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

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
    
    // Generate token number (4-digit)
    const tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Calculate estimated time (15-35 minutes based on item count)
    const estimatedTime = Math.min(35, Math.max(15, items.length * 3 + 15));

    // Ensure items have proper structure
    const formattedItems = items.map(item => {
      // If itemId is not a valid ObjectId (e.g., combo items), set it to null
      let itemId = item.itemId || item._id;
      if (itemId && !mongoose.Types.ObjectId.isValid(itemId)) {
        itemId = null; // Combo items or items without valid menu reference
      }
      
      return {
        itemId: itemId || null,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        customization: item.customization || {},
        isCombo: item.isCombo || false,
        comboItems: item.comboItems || []
      };
    });

    const order = new Order({
      orderNumber,
      items: formattedItems,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid',
      orderStatus: 'Placed', // Set initial order status
      tokenNumber,
      estimatedTime
    });

    await order.save();
    
    // AUTO-REDUCE INVENTORY ON ORDER CREATION
    for (const item of formattedItems) {
      if (item.itemId && mongoose.Types.ObjectId.isValid(item.itemId)) {
        try {
          const menuItem = await Menu.findById(item.itemId);
          if (menuItem && menuItem.stock !== undefined) {
            const newStock = Math.max(0, menuItem.stock - item.quantity);
            menuItem.stock = newStock;
            await menuItem.save();
            console.log(`📦 Inventory updated: ${menuItem.name} - Stock: ${menuItem.stock} → ${newStock}`);
          }
        } catch (inventoryError) {
          console.error(`Error updating inventory for item ${item.itemId}:`, inventoryError);
        }
      }
    }
    
    // Try to populate items, but handle cases where itemId might not exist (e.g., combo items)
    try {
      await order.populate('items.itemId');
    } catch (populateError) {
      // If populate fails, continue without it (for combo items or items not in menu)
      console.log('Note: Some items could not be populated (may be combo items)');
    }
    
    // Emit Socket.io events for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit new order to admin and kitchen
      io.to('admin').emit('new-order', order);
      io.to('kitchen').emit('new-order', order);
      
      // Emit dashboard update event to refresh all stats
      io.to('admin').emit('dashboard-update', { 
        message: 'New order placed - dashboard refresh required',
        orderId: order._id 
      });
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/order/:orderId - Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Try to populate items, but handle errors gracefully
    try {
      await order.populate('items.itemId');
    } catch (populateError) {
      // Continue without populate if it fails
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
      .limit(100);
    
    // Try to populate items for each order, but handle errors
    for (let order of orders) {
      try {
        await order.populate('items.itemId');
      } catch (populateError) {
        // Continue without populate if it fails
      }
    }
    
    res.json({ data: orders, success: true });
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

// PUT /api/order/:orderId/status - Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit Socket.io events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('order-status-updated', order);
      io.to('kitchen').emit('order-status-updated', order);
      io.to(`order-${order._id}`).emit('order-status-updated', order);
      
      // Emit dashboard update event to refresh all stats
      io.to('admin').emit('dashboard-update', { 
        message: 'Order status updated - dashboard refresh required',
        orderId: order._id 
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

