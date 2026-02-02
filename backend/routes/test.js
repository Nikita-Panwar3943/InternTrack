const express = require('express');
const router = express.Router();

// Test route to check environment variables
router.get('/env', (req, res) => {
  res.json({
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'not set',
      api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set'
    }
  });
});

module.exports = router;
