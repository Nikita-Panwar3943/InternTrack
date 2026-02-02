# Deployment Guide

This guide will help you deploy your Student Internship & Skill Tracker application to production.

## 🚀 Deployment Overview

### Frontend: Vercel
- **Platform**: Vercel (Recommended for React apps)
- **URL**: Your custom domain or `*.vercel.app`
- **Build Time**: ~2-3 minutes
- **Cost**: Free tier available

### Backend: Render
- **Platform**: Render (Recommended for Node.js apps)
- **URL**: Your custom domain or `*.onrender.com`
- **Build Time**: ~3-5 minutes
- **Cost**: Free tier available

### Database: MongoDB Atlas
- **Platform**: MongoDB Atlas
- **Plan**: Free tier (M0 Sandbox) available
- **Region**: Choose closest to your users

---

## 📋 Prerequisites

1. **Git Repository**: Your code should be pushed to GitHub
2. **Accounts**: 
   - [Vercel Account](https://vercel.com/signup)
   - [Render Account](https://render.com/register)
   - [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
3. **Environment Variables**: Have all required variables ready

---

## 🗄️ Step 1: Set Up MongoDB Atlas

If you haven't already, follow the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide.

### Production Configuration
1. **Upgrade to M10+** for production (optional but recommended)
2. **Enable Backups**: In your cluster settings
3. **Configure IP Whitelist**: Add Render and Vercel IPs
4. **Set up Monitoring**: Enable performance monitoring

---

## 🔧 Step 2: Configure Backend for Production

### Update Environment Variables
Create `backend/.env.production`:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internship-tracker-prod

# JWT Secret (use a strong, unique secret)
JWT_SECRET=your_super_long_and_secure_jwt_secret_key_for_production

# Server Configuration
PORT=5000
NODE_ENV=production

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (update with your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app

# CORS Configuration
CORS_ORIGIN=https://your-app.vercel.app
```

### Update package.json Scripts
Add production scripts to `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required for Node.js'",
    "test": "jest"
  }
}
```

### Create Health Check Endpoint
Ensure you have this in `backend/server.js`:

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});
```

---

## 🌐 Step 3: Deploy Backend to Render

### 1. Connect GitHub Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 2. Configure Service
- **Name**: `internship-tracker-api`
- **Region**: Choose closest to your database
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Add Environment Variables
In Render Dashboard → Your Service → Environment:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Deploy
- Click **"Create Web Service"**
- Wait for deployment (3-5 minutes)
- Test your API: `https://your-service.onrender.com/api/health`

---

## ⚛️ Step 4: Configure Frontend for Production

### Update Environment Variables
Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-service.onrender.com/api
VITE_NODE_ENV=production
```

### Update vite.config.js
Ensure proper build configuration:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 🚀 Step 5: Deploy Frontend to Vercel

### 1. Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### 2. Configure Project
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Add Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:
```
VITE_API_URL=https://your-service.onrender.com/api
VITE_NODE_ENV=production
```

### 4. Deploy
- Click **"Deploy"**
- Wait for deployment (2-3 minutes)
- Your app will be available at `https://your-app.vercel.app`

---

## 🔒 Step 6: Security Configuration

### Backend Security
1. **HTTPS**: Render provides automatic SSL
2. **Rate Limiting**: Already configured in `backend/server.js`
3. **CORS**: Properly configured with your frontend URL
4. **Environment Variables**: Never commit `.env` files

### Frontend Security
1. **HTTPS**: Vercel provides automatic SSL
2. **Environment Variables**: Sensitive data is server-side only
3. **API Keys**: Never expose in client-side code

---

## 📊 Step 7: Monitoring and Maintenance

### Backend Monitoring (Render)
1. **Logs**: View in Render Dashboard
2. **Metrics**: CPU, Memory, Response times
3. **Alerts**: Set up for downtime
4. **Backups**: MongoDB Atlas automatic backups

### Frontend Monitoring (Vercel)
1. **Analytics**: Built-in Vercel Analytics
2. **Performance**: Core Web Vitals
3. **Error Tracking**: Consider Sentry for production
4. **Build Logs**: View in Vercel Dashboard

---

## 🔄 Step 8: CI/CD Pipeline

### Automatic Deployments
Both Vercel and Render provide automatic deployments:
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Preview deployments

### Manual Deployments
- **Render**: Manual deploy in dashboard
- **Vercel**: Redeploy in dashboard or via CLI

---

## 🧪 Step 9: Testing Production

### Checklist
- [ ] Backend health check: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] User registration works
- [ ] Login works
- [ ] Database operations work
- [ ] File uploads work (if configured)
- [ ] Email notifications work (if configured)

### Common Issues and Solutions

#### CORS Issues
```javascript
// backend/server.js
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

#### Database Connection
```javascript
// backend/server.js
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

#### Build Failures
- Check `package.json` scripts
- Verify all dependencies are in `dependencies`
- Check build logs for specific errors

---

## 📈 Step 10: Performance Optimization

### Backend Optimization
1. **Database Indexing**: Already configured in models
2. **Caching**: Consider Redis for frequent queries
3. **Compression**: Add compression middleware
4. **CDN**: For static assets

### Frontend Optimization
1. **Code Splitting**: Already configured in Vite
2. **Image Optimization**: Use WebP format
3. **Lazy Loading**: Implement for large components
4. **Bundle Analysis**: Use `npm run build -- --analyze`

---

## 🆘 Troubleshooting

### Common Issues

#### 502 Bad Gateway
- Check if backend is running
- Verify environment variables
- Check Render logs

#### 404 Not Found
- Check API endpoints
- Verify routing configuration
- Check build output

#### Authentication Issues
- Verify JWT_SECRET is same on both ends
- Check CORS configuration
- Verify token storage

#### Database Issues
- Check MongoDB Atlas connection
- Verify IP whitelist
- Check database user permissions

### Getting Help
1. **Logs**: Check Render and Vercel logs
2. **Documentation**: Platform documentation
3. **Community**: Stack Overflow, GitHub Issues
4. **Support**: Platform support teams

---

## 🎉 You're Live!

Your Student Internship & Skill Tracker is now deployed and accessible to users worldwide!

### Next Steps
1. **Monitor**: Keep an eye on performance and errors
2. **Backup**: Regular database backups
3. **Update**: Keep dependencies updated
4. **Scale**: Upgrade plans as needed
5. **Security**: Regular security audits

### URLs to Save
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-api.onrender.com/api`
- **Database**: MongoDB Atlas Dashboard
- **Monitoring**: Render & Vercel Dashboards

Congratulations! 🎊
