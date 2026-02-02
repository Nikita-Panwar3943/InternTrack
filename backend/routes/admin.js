const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAnalytics,
  getAllStudents,
  getStudentDetails,
  getAllInternships,
  approveInternship,
  rejectInternship,
  toggleUserStatus,
  getAllRecruiters,
  verifyRecruiter
} = require('../controllers/adminController');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Students management
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Internships management
router.get('/internships', getAllInternships);
router.put('/internships/:id/approve', approveInternship);
router.put('/internships/:id/reject', rejectInternship);

// Recruiters management
router.get('/recruiters', getAllRecruiters);
router.put('/recruiters/:id/verify', verifyRecruiter);

module.exports = router;
