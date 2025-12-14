# 🍗 Restaurant Self-Ordering System

A complete, production-ready restaurant self-ordering system similar to McDonald's self-service kiosk. Built with React.js, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Admin Credentials](#admin-credentials)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Customer Features
- 🎯 **Welcome Screen** - Touch-friendly start interface
- 🍽️ **Menu Browsing** - Browse items by category (Starters, Main Course, Drinks, Desserts)
- 🛒 **Shopping Cart** - Add/remove items, update quantities
- 💳 **Payment Processing** - Multiple payment methods (Cash, Card, UPI) with mock gateway
- 🧾 **Receipt Generation** - Automatic receipt with order details and print functionality
- 📱 **Touchscreen Optimized** - Large buttons and kiosk-friendly UI

### Admin Features
- 🔐 **Admin Authentication** - Secure login system
- 📝 **Menu Management** - Add, edit, delete menu items
- 📊 **Order Management** - View all orders with filtering options
- 📈 **Revenue Tracking** - View total revenue from paid orders
- 🔍 **Order Filtering** - Filter by date and payment status

## 🛠 Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
restaurant-ordering-system/
├── backend/
│   ├── models/
│   │   ├── Menu.js          # Menu item schema
│   │   └── Order.js          # Order schema
│   ├── routes/
│   │   ├── menu.js           # Menu API routes
│   │   ├── order.js          # Order API routes
│   │   ├── payment.js        # Payment API routes
│   │   └── admin.js          # Admin API routes
│   ├── scripts/
│   │   └── seedData.js       # Database seeding script
│   ├── server.js             # Express server
│   ├── package.json
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable components (if any)
│   │   ├── context/
│   │   │   ├── CartContext.js    # Cart state management
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── pages/
│   │   │   ├── customer/     # Customer-facing pages
│   │   │   │   ├── WelcomeScreen.js
│   │   │   │   ├── MenuScreen.js
│   │   │   │   ├── CartScreen.js
│   │   │   │   ├── PaymentScreen.js
│   │   │   │   └── ReceiptScreen.js
│   │   │   └── admin/        # Admin pages
│   │   │       ├── AdminLogin.js
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminMenu.js
│   │   │       └── AdminOrders.js
│   │   ├── services/
│   │   │   └── api.js        # API service functions
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB Compass** (Optional) - GUI for MongoDB - [Download](https://www.mongodb.com/try/download/compass)

## 🚀 Installation

### Step 1: Clone or Navigate to Project Directory

```bash
cd "C:\2025\Flying Chicken\Restarant_billing recipt"
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `backend` directory
2. The `.env` file is already created with default values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/restaurant_ordering
   JWT_SECRET=restaurant_ordering_secret_key_2024
   NODE_ENV=development
   ```

3. **Important**: Make sure MongoDB is running on your local machine
   - If MongoDB is installed as a service, it should start automatically
   - Or start MongoDB manually:
     ```bash
     # Windows (if installed manually)
     mongod
     
     # Or if using MongoDB as a service, it should already be running
     ```

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Create a `.env` file (optional, defaults to localhost:5000):
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## 🏃 Running the Application

### Step 1: Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# Check if MongoDB is running
# On Windows, check Services or run:
mongod
```

**Using MongoDB Compass:**
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- The database `restaurant_ordering` will be created automatically

### Step 2: Seed the Database (First Time Only)

```bash
cd backend
npm run seed
```

This will populate the database with sample menu items.

### Step 3: Start the Backend Server

```bash
# In the backend directory
npm run dev
# or
npm start
```

The backend server will run on `http://localhost:5000`

### Step 4: Start the Frontend Development Server

Open a **new terminal** window:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 🌐 Accessing the Application

### Customer Interface
- **URL**: `http://localhost:3000`
- **Features**: Browse menu, add to cart, make payment, view receipt

### Admin Interface
- **URL**: `http://localhost:3000/admin/login`
- **Credentials**:
  - Username: `admin`
  - Password: `admin123`

## 📡 API Endpoints

### Menu Endpoints
- `GET /api/menu` - Get all menu items
- `GET /api/menu?category=Starters` - Get items by category
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Order Endpoints
- `POST /api/order` - Create new order
- `GET /api/order/:orderId` - Get order by ID
- `GET /api/order` - Get all orders (Admin)
- `GET /api/order?date=2024-01-01&status=Paid` - Filter orders
- `PUT /api/order/:orderId/receipt` - Mark receipt as printed

### Payment Endpoints
- `POST /api/payment` - Process payment (mock)
  ```json
  {
    "amount": 500,
    "paymentMethod": "Card"
  }
  ```

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify admin token

## 🔐 Admin Credentials

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ Security Note**: In production, change these credentials and use environment variables!

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: `MongoDB connection error`

**Solutions**:
1. Ensure MongoDB is running:
   ```bash
   # Check MongoDB service status
   # Windows: Services → MongoDB
   ```

2. Verify MongoDB URI in `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/restaurant_ordering
   ```

3. Try connecting with MongoDB Compass to verify connection

### Port Already in Use

**Problem**: `Port 5000 is already in use`

**Solution**: Change the port in `backend/.env`:
```
PORT=5001
```

And update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### CORS Errors

**Problem**: CORS errors in browser console

**Solution**: The backend already has CORS enabled. If issues persist, check:
- Backend server is running
- Frontend is using correct API URL
- No firewall blocking connections

### Module Not Found Errors

**Problem**: `Cannot find module 'xxx'`

**Solution**: 
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Seeding Issues

**Problem**: Seed script fails

**Solution**:
1. Ensure MongoDB is running
2. Check MongoDB connection string
3. Run seed script manually:
   ```bash
   cd backend
   node scripts/seedData.js
   ```

## 📝 Development Notes

### Adding New Menu Items

1. Login as admin
2. Navigate to Menu Management
3. Click "Add Item"
4. Fill in the form and save

### Testing Payment

The payment gateway is a mock system that:
- Simulates 90% success rate
- Randomly returns success/failure
- Includes network delay simulation

### Receipt Printing

- Receipts auto-print after successful payment
- Manual print button available
- Uses browser's print dialog
- Optimized for thermal printers

## 🎨 Customization

### Changing Colors

Edit `frontend/tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: {
    // Your color values
  }
}
```

### Adding Categories

1. Update `categories` array in:
   - `backend/models/Menu.js` (enum)
   - `frontend/src/pages/customer/MenuScreen.js`
   - `frontend/src/pages/admin/AdminMenu.js`

## 📦 Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

The build folder contains production-ready files.

### Deploy Backend

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name restaurant-api
   ```

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check console logs for errors

## 🎉 Success!

If everything is set up correctly, you should see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Sample menu items loaded

Enjoy your restaurant ordering system! 🍗

