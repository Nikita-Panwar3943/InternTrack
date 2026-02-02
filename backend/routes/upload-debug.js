const express = require('express');
const multer = require('multer');
const { catchAsync } = require('../utils/errorHandler');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Debug upload endpoint
router.post('/resume', upload.single('resume'), catchAsync(async (req, res) => {
  console.log('=== DEBUG UPLOAD ===');
  console.log('File received:', !!req.file);
  console.log('File details:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file');
  
  // Test Cloudinary connection
  try {
    const cloudinary = require('cloudinary').v2;
    console.log('Cloudinary credentials:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });
    
    // Test Cloudinary API access
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping result:', result);
    
  } catch (error) {
    console.error('Cloudinary error:', error.message);
  }
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Debug upload successful',
    debug: {
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      cloudinary: {
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      }
    }
  });
}));

module.exports = router;
