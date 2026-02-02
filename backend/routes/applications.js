const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  validateApplication
} = require('../middleware/validation');
const {
  applyForInternship,
  getStudentApplications,
  getApplicationDetails,
  withdrawApplication,
  updateApplication,
  getApplicationStats,
  addNote
} = require('../controllers/applicationController');

// Apply for internship (student only)
router.post('/internships/:internshipId/apply', 
  protect, 
  authorize('student'), 
  validateApplication, 
  applyForInternship
);

// Get student's applications (student only)
router.get('/my-applications', 
  protect, 
  authorize('student'), 
  getStudentApplications
);

// Get application details (student or recruiter)
router.get('/:id', 
  protect, 
  getApplicationDetails
);

// Withdraw application (student only)
router.put('/:id/withdraw', 
  protect, 
  authorize('student'), 
  withdrawApplication
);

// Update application (recruiter only)
router.put('/:id', 
  protect, 
  authorize('recruiter'), 
  updateApplication
);

// Add note to application (recruiter only)
router.post('/:id/notes', 
  protect, 
  authorize('recruiter'), 
  addNote
);

// Get application statistics (student or recruiter)
router.get('/stats/me', 
  protect, 
  getApplicationStats
);

module.exports = router;
