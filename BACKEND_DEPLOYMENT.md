# Backend Deployment Guide

## ⚠️ Current Status

The **frontend is successfully deployed** on GitHub Pages at:
**https://tarun2231.github.io/Restarant_billing/**

However, the **backend API is not yet deployed**, which is why you're seeing "Login failed" errors. The frontend is trying to connect to `localhost:5000`, which doesn't exist on GitHub Pages.

## 🚀 Deploy Backend to Make It Work

You need to deploy the backend separately. Here are the recommended platforms:

### Option 1: Render (Recommended - Free Tier Available)

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `restaurant-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to project root)

5. **Add Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key_here
   NODE_ENV=production
   ```

6. **Deploy** and copy the URL (e.g., `https://restaurant-backend.onrender.com`)

7. **Update Frontend API URL:**
   - Create `.env.production` in `frontend` directory:
     ```
     REACT_APP_API_URL=https://restaurant-backend.onrender.com/api
     ```
   - Rebuild and redeploy frontend:
     ```bash
     cd frontend
     npm run deploy
     ```

### Option 2: Railway (Free Tier Available)

1. **Sign up** at [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Add MongoDB** (Railway provides MongoDB addon)
5. **Set Environment Variables** (same as above)
6. **Deploy** and get the URL

### Option 3: Heroku (Free Tier Discontinued, but Still Popular)

1. **Install Heroku CLI**
2. **Login**: `heroku login`
3. **Create app**: `heroku create restaurant-backend`
4. **Add MongoDB**: `heroku addons:create mongolab:sandbox`
5. **Set config vars**:
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set NODE_ENV=production
   ```
6. **Deploy**: `git push heroku main`

### Option 4: MongoDB Atlas (Database) + Any Hosting

1. **Create MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster**
3. **Get connection string**
4. **Deploy backend** to any Node.js hosting (Render, Railway, Heroku, etc.)
5. **Use Atlas connection string** in environment variables

## 📝 Quick Setup Steps (Render Example)

### Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Create database user
5. Whitelist IP address (0.0.0.0/0 for all IPs - development only)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_ordering?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `restaurant-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. **Add Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_ordering?retryWrites=true&w=majority
   JWT_SECRET=restaurant_ordering_secret_key_2024_production
   NODE_ENV=production
   ```

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Copy the service URL (e.g., `https://restaurant-backend.onrender.com`)

### Step 3: Update Frontend to Use Backend URL

1. **Create `.env.production` file** in `frontend` directory:
   ```bash
   cd frontend
   echo REACT_APP_API_URL=https://restaurant-backend.onrender.com/api > .env.production
   ```

2. **Rebuild and redeploy frontend:**
   ```bash
   npm run deploy
   ```

3. **Update CORS in backend** (if needed):
   - In `backend/server.js`, ensure CORS allows your GitHub Pages domain:
   ```javascript
   origin: ['https://tarun2231.github.io', 'http://localhost:3000']
   ```

### Step 4: Seed the Database

After backend is deployed, you need to seed the database:

1. **Option A: Use MongoDB Atlas UI**
   - Connect to your cluster
   - Create `restaurant_ordering` database
   - Import sample data

2. **Option B: Run seed script locally** (pointing to Atlas):
   ```bash
   cd backend
   # Update .env with Atlas connection string
   node scripts/seedData.js
   ```

3. **Option C: Create seed endpoint** (temporary):
   - Add a `/api/seed` endpoint in backend
   - Call it once after deployment
   - Remove it after seeding

## ✅ Verification

After deployment:

1. **Test backend health:**
   ```
   https://your-backend-url.com/api/menu
   ```
   Should return menu items or empty array.

2. **Test frontend:**
   - Go to https://tarun2231.github.io/Restarant_billing/
   - Try admin login
   - Should work now!

## 🔒 Security Notes

1. **Change default admin credentials** in production
2. **Use strong JWT_SECRET** (random string, 32+ characters)
3. **Restrict CORS** to only your frontend domain
4. **Use environment variables** for all secrets
5. **Enable MongoDB authentication** and IP whitelisting

## 🐛 Troubleshooting

### Backend Not Starting

- Check build logs in Render/Railway dashboard
- Verify all environment variables are set
- Check MongoDB connection string format

### CORS Errors

- Update CORS origin in `backend/server.js` to include your GitHub Pages URL
- Redeploy backend after changes

### Database Connection Issues

- Verify MongoDB Atlas connection string
- Check IP whitelist (0.0.0.0/0 for all, or specific IPs)
- Verify database user credentials

### Frontend Still Shows Errors

- Clear browser cache
- Verify `.env.production` has correct backend URL
- Rebuild and redeploy frontend
- Check browser console for specific errors

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

---

**Need Help?** Check the deployment logs in your hosting platform's dashboard for specific error messages.

