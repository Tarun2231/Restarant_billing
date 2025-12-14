const mongoose = require('mongoose');
require('dotenv').config();
const Menu = require('../models/Menu');

const sampleMenuItems = [
  // Starters
  {
    name: 'Chicken Wings',
    category: 'Starters',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27137b2a8b8?w=400',
    description: 'Crispy fried chicken wings with spicy sauce',
    isAvailable: true
  },
  {
    name: 'Spring Rolls',
    category: 'Starters',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    description: 'Vegetable spring rolls with sweet chili sauce',
    isAvailable: true
  },
  {
    name: 'French Fries',
    category: 'Starters',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    description: 'Golden crispy french fries',
    isAvailable: true
  },
  {
    name: 'Onion Rings',
    category: 'Starters',
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1615367423057-4b4b1f3b8c8e?w=400',
    description: 'Crispy battered onion rings',
    isAvailable: true
  },
  
  // Main Course
  {
    name: 'Grilled Chicken Burger',
    category: 'Main Course',
    price: 399,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    description: 'Juicy grilled chicken patty with fresh vegetables',
    isAvailable: true
  },
  {
    name: 'Chicken Pizza',
    category: 'Main Course',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    description: '12" pizza with chicken, cheese, and vegetables',
    isAvailable: true
  },
  {
    name: 'Chicken Biryani',
    category: 'Main Course',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400',
    description: 'Fragrant basmati rice with spiced chicken',
    isAvailable: true
  },
  {
    name: 'Grilled Chicken Wrap',
    category: 'Main Course',
    price: 279,
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
    description: 'Grilled chicken with vegetables in tortilla wrap',
    isAvailable: true
  },
  {
    name: 'Chicken Pasta',
    category: 'Main Course',
    price: 329,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    description: 'Creamy pasta with grilled chicken',
    isAvailable: true
  },
  
  // Drinks
  {
    name: 'Coca Cola',
    category: 'Drinks',
    price: 79,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    description: 'Chilled cola drink',
    isAvailable: true
  },
  {
    name: 'Orange Juice',
    category: 'Drinks',
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    description: 'Fresh orange juice',
    isAvailable: true
  },
  {
    name: 'Iced Tea',
    category: 'Drinks',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    description: 'Refreshing iced tea',
    isAvailable: true
  },
  {
    name: 'Coffee',
    category: 'Drinks',
    price: 119,
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
    description: 'Hot coffee',
    isAvailable: true
  },
  {
    name: 'Milkshake',
    category: 'Drinks',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
    description: 'Chocolate milkshake',
    isAvailable: true
  },
  
  // Desserts
  {
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    description: 'Rich chocolate cake slice',
    isAvailable: true
  },
  {
    name: 'Ice Cream Sundae',
    category: 'Desserts',
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    description: 'Vanilla ice cream with chocolate sauce',
    isAvailable: true
  },
  {
    name: 'Apple Pie',
    category: 'Desserts',
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    description: 'Warm apple pie with vanilla ice cream',
    isAvailable: true
  },
  {
    name: 'Cheesecake',
    category: 'Desserts',
    price: 219,
    imageUrl: 'https://images.unsplash.com/photo-1524351199674-9415243681ce?w=400',
    description: 'New York style cheesecake',
    isAvailable: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Clear existing menu items
    await Menu.deleteMany({});
    console.log('🗑️  Cleared existing menu items');

    // Insert sample menu items
    await Menu.insertMany(sampleMenuItems);
    console.log(`✅ Inserted ${sampleMenuItems.length} menu items`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

