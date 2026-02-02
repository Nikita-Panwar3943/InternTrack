const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  validateStudentProfile,
  validateEducation,
  validateExperience
} = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  addSkill,
  updateSkill,
  removeSkill,
  getApplications,
  getSkillAssessments,
  browseInternships,
  getInternshipDetails,
  getStats
} = require('../controllers/studentController');

// All routes are protected and require student role
router.use(protect);
router.use(authorize('student'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateStudentProfile, updateProfile);

// Skills routes
router.post('/skills', addSkill);
router.put('/skills/:skillId', updateSkill);
router.delete('/skills/:skillId', removeSkill);

// Applications routes
router.get('/applications', getApplications);

// Skill assessments routes
router.get('/assessments', getSkillAssessments);

// Internships routes
router.get('/internships', browseInternships);
router.get('/internships/:id', getInternshipDetails);

// Stats route
router.get('/stats', getStats);

module.exports = router;
