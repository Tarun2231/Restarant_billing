const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Starters', 'Main Course', 'Drinks', 'Desserts'],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Food+Item'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  minStock: {
    type: Number,
    default: 10,
    min: 0
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);

