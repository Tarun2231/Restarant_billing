# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Terminal/Command Prompt ready

### Step-by-Step Setup

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 3. Start MongoDB
Make sure MongoDB is running:
- **Windows**: Check Services → MongoDB should be running
- **Manual**: Run `mongod` in a terminal

#### 4. Seed Database (First Time)
```bash
cd backend
npm run seed
```

You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing menu items
✅ Inserted 18 menu items
🎉 Database seeded successfully!
```

#### 5. Start Backend Server
```bash
# In backend directory
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

#### 6. Start Frontend (New Terminal)
```bash
# In frontend directory
npm start
```

Browser should open automatically at `http://localhost:3000`

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected (check backend console)
- [ ] Can see welcome screen
- [ ] Can browse menu items
- [ ] Can add items to cart
- [ ] Admin login works (admin/admin123)

## 🎯 Test the System

1. **Customer Flow**:
   - Click "Start Order"
   - Browse menu, add items
   - Go to cart, proceed to payment
   - Complete payment
   - View receipt

2. **Admin Flow**:
   - Click "Admin Login" on welcome screen
   - Login with admin/admin123
   - View dashboard
   - Manage menu items
   - View orders

## 🐛 Common Issues

### MongoDB Not Running
**Error**: `MongoDB connection error`

**Fix**: 
- Start MongoDB service
- Or run `mongod` manually
- Verify connection with MongoDB Compass

### Port Already in Use
**Error**: `Port 5000 is already in use`

**Fix**: Change port in `backend/.env` to 5001

### Module Not Found
**Error**: `Cannot find module`

**Fix**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Need Help?

Check the main README.md for detailed documentation.

