const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getAllInternships,
  getInternshipById,
  searchInternships,
  getFeaturedInternships,
  getInternshipStats,
  getSimilarInternships
} = require('../controllers/internshipController');

// Public routes (no authentication required)
router.get('/', getAllInternships);
router.get('/search', searchInternships);
router.get('/featured', getFeaturedInternships);
router.get('/stats', getInternshipStats);
router.get('/:id', getInternshipById);
router.get('/:id/similar', getSimilarInternships);

module.exports = router;
