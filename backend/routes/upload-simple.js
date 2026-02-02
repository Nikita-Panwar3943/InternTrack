const express = require('express');
const router = express.Router();

// Simple test upload endpoint
router.post('/resume', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload endpoint is working!',
    test: true
  });
});

module.exports = router;
