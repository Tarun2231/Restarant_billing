# 🚀 Running the Application Locally (Git Bash)

## Quick Start Commands (Git Bash)

### 1. Install Dependencies (First Time Only)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed Database (First Time Only)

```bash
cd backend
npm run seed
```

### 3. Start Backend Server

Open **Git Bash Terminal 1**:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### 4. Start Frontend Server

Open **Git Bash Terminal 2** (new terminal):
```bash
cd frontend
npm start
```

The browser will automatically open to `http://localhost:3000`

## 🌐 Access Points

- **Frontend (Customer Interface)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health
- **Admin Login**: http://localhost:3000/admin/login

## 🔑 Admin Credentials

- Username: `admin`
- Password: `admin123`

## ✅ Verification

1. Backend should show: `✅ Connected to MongoDB` and `🚀 Server running on port 5000`
2. Frontend should compile and open in browser automatically
3. You should see the Welcome Screen with "Start Order" button

## 🛑 Stopping Servers

Press `Ctrl + C` in each terminal to stop the servers.

## 🔄 Restarting

If you need to restart:
1. Stop both servers (Ctrl + C)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`

