const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    
    if (category) {
      query.category = category;
    }
    // Only filter by isAvailable if explicitly set to false
    // This allows items without the field to be shown
    query.$or = [
      { isAvailable: { $ne: false } },
      { isAvailable: { $exists: false } }
    ];
    
    const menuItems = await Menu.find(query).sort({ category: 1, name: 1 });
    res.json({ data: menuItems, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/menu - Create menu item (Admin)
router.post('/', async (req, res) => {
  try {
    const menuItem = new Menu(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/menu/:id - Update menu item (Admin)
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Emit Socket.io event for inventory update
    const io = req.app.get('io');
    if (io) {
      // Emit inventory update event to admin room
      io.to('admin').emit('inventory-updated', {
        itemId: menuItem._id,
        itemName: menuItem.name,
        stock: menuItem.stock,
        minStock: menuItem.minStock,
      });
      
      // Emit dashboard update event to refresh all stats
      io.to('admin').emit('dashboard-update', {
        message: 'Inventory updated - dashboard refresh required',
        itemId: menuItem._id,
      });
      
      console.log(`📦 Inventory updated via API: ${menuItem.name} - Stock: ${menuItem.stock}, Min: ${menuItem.minStock}`);
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/menu/:id - Delete menu item (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

