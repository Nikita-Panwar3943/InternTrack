const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  validateInternship
} = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  createInternship,
  getInternships,
  updateInternship,
  deleteInternship,
  getApplicants,
  updateApplicationStatus,
  getAllApplicants,
  getStats,
  scheduleInterview
} = require('../controllers/recruiterController');

// All routes are protected and require recruiter role
router.use(protect);
router.use(authorize('recruiter'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Internship routes
router.post('/internships', validateInternship, createInternship);
router.get('/internships', getInternships);
router.put('/internships/:id', updateInternship);
router.delete('/internships/:id', deleteInternship);

// Application routes
router.get('/internships/:internshipId/applicants', getApplicants);
router.get('/applications', getAllApplicants);
router.put('/applications/:applicationId/status', updateApplicationStatus);
router.put('/applications/:applicationId/schedule-interview', scheduleInterview);

// Stats route
router.get('/stats', getStats);

module.exports = router;
