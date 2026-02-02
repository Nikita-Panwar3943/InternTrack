const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const recruiterRoutes = require('./routes/recruiters');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const uploadRoutes = require('./routes/upload');
const testRoutes = require('./routes/test');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://intern-track-o5hx.vercel.app', process.env.FRONTEND_URL],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection - with fallback
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.log('⚠️  Running in demo mode without database persistence');
  console.log('📝 Please whitelist your IP in MongoDB Atlas to enable full functionality');
});

// Serve static files (for resume uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Demo mode middleware for when MongoDB is not connected
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Handle auth routes in demo mode
    if (req.path.includes('/auth/')) {
      if (req.path.endsWith('/login')) {
        return res.status(200).json({
          success: true,
          message: 'Login successful (Demo Mode)',
          token: 'demo_token_' + Date.now(),
          user: {
            _id: 'demo_user_id',
            email: req.body.email || 'demo@example.com',
            role: 'student',
            firstName: 'Demo',
            lastName: 'User'
          }
        });
      }
      if (req.path.endsWith('/register')) {
        return res.status(201).json({
          success: true,
          message: 'Registration successful (Demo Mode)',
          token: 'demo_token_' + Date.now(),
          user: {
            _id: 'demo_user_id',
            email: req.body.email || 'demo@example.com',
            role: req.body.role || 'student',
            firstName: req.body.firstName || 'Demo',
            lastName: req.body.lastName || 'User'
          }
        });
      }
    }
    
    // Handle other routes with demo responses
    if (req.path.includes('/students/') || req.path.includes('/recruiters/') || req.path.includes('/internships/')) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode - MongoDB not connected',
        data: req.path.includes('/internships') ? [] : {}
      });
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/test', testRoutes);

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Debug route working!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Student Internship Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
