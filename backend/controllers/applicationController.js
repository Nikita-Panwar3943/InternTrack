const Application = require('../models/Application');
const Internship = require('../models/Internship');
const StudentProfile = require('../models/StudentProfile');
const { catchAsync } = require('../utils/errorHandler');

// Apply for internship
const applyForInternship = catchAsync(async (req, res) => {
  const { internshipId } = req.params;
  const { coverLetter, resume } = req.body;

  // Check if internship exists and is active
  const internship = await Internship.findById(internshipId);

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  if (!internship.isActive || !internship.isApproved) {
    return res.status(400).json({
      message: 'Internship is not available for applications'
    });
  }

  if (new Date() > internship.applicationDeadline) {
    return res.status(400).json({
      message: 'Application deadline has passed'
    });
  }

  // Check if student has already applied
  const existingApplication = await Application.findOne({
    student: req.user._id,
    internship: internshipId
  });

  if (existingApplication) {
    return res.status(400).json({
      message: 'You have already applied for this internship'
    });
  }

  // Create application with resume
  const application = new Application({
    student: req.user._id,
    internship: internshipId,
    recruiter: internship.recruiter,
    coverLetter,
    resume: resume || null
  });

  await application.save();

  // Update internship application count
  internship.applicationsCount += 1;
  await internship.save();

  // Update student stats
  await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { 'stats.applicationsCount': 1 } }
  );

  // Update recruiter stats
  const RecruiterProfile = require('../models/RecruiterProfile');
  await RecruiterProfile.findOneAndUpdate(
    { user: internship.recruiter },
    { $inc: { 'stats.applicationsReceived': 1 } }
  );

  res.status(201).json({
    success: true,
    application,
    message: 'Application submitted successfully'
  });
});

// Get student's applications
const getStudentApplications = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status
  } = req.query;

  // Build query
  const query = { student: req.user._id };

  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('internship', 'title company location workType applicationDeadline')
    .populate('recruiter', 'username email')
    .sort({ appliedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    applications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get application details
const getApplicationDetails = catchAsync(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('internship', 'title company location workType description requirements')
    .populate('recruiter', 'username email')
    .populate('student', 'username email')
    .populate({
      path: 'student',
      populate: {
        path: 'profile',
        model: 'StudentProfile'
      }
    })
    .populate('notes.author', 'username');

  if (!application) {
    return res.status(404).json({
      message: 'Application not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: 'You can only view your own applications'
    });
  }

  if (req.user.role === 'recruiter') {
    const internship = await Internship.findById(application.internship._id);
    if (internship.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only view applications for your internships'
      });
    }
  }

  res.status(200).json({
    success: true,
    application
  });
});

// Withdraw application
const withdrawApplication = catchAsync(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    student: req.user._id
  });

  if (!application) {
    return res.status(404).json({
      message: 'Application not found or you do not have permission to withdraw it'
    });
  }

  if (application.status === 'selected') {
    return res.status(400).json({
      message: 'Cannot withdraw a selected application'
    });
  }

  application.status = 'withdrawn';
  await application.save();

  // Update internship application count
  await Internship.findByIdAndUpdate(
    application.internship,
    { $inc: { applicationsCount: -1 } }
  );

  res.status(200).json({
    success: true,
    application,
    message: 'Application withdrawn successfully'
  });
});

// Update application (add notes, feedback)
const updateApplication = catchAsync(async (req, res) => {
  const { notes, feedback } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      message: 'Application not found'
    });
  }

  // Check permissions
  if (req.user.role === 'recruiter') {
    const internship = await Internship.findById(application.internship);
    if (internship.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only update applications for your internships'
      });
    }
  }

  // Add notes
  if (notes) {
    application.notes.push({
      author: req.user._id,
      content: notes,
      createdAt: new Date()
    });
  }

  // Add feedback
  if (feedback) {
    application.feedback = {
      rating: feedback.rating,
      comments: feedback.comments,
      givenBy: req.user._id,
      givenAt: new Date()
    };
  }

  await application.save();

  res.status(200).json({
    success: true,
    application,
    message: 'Application updated successfully'
  });
});

// Get application statistics
const getApplicationStats = catchAsync(async (req, res) => {
  let query = {};

  // Filter based on user role
  if (req.user.role === 'student') {
    query.student = req.user._id;
  } else if (req.user.role === 'recruiter') {
    const internships = await Internship.find({ recruiter: req.user._id }).select('_id');
    query.internship = { $in: internships.map(i => i._id) };
  }

  const totalApplications = await Application.countDocuments(query);

  const statusStats = await Application.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const monthlyApplications = await Application.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$appliedAt' },
          month: { $month: '$appliedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const stats = {
    totalApplications,
    statusStats,
    monthlyApplications
  };

  res.status(200).json({
    success: true,
    stats
  });
});

// Add note to application
const addNote = catchAsync(async (req, res) => {
  const { content } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      message: 'Application not found'
    });
  }

  // Check permissions
  if (req.user.role === 'recruiter') {
    const internship = await Internship.findById(application.internship);
    if (internship.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only add notes to applications for your internships'
      });
    }
  }

  application.notes.push({
    author: req.user._id,
    content,
    createdAt: new Date()
  });

  await application.save();

  res.status(201).json({
    success: true,
    application,
    message: 'Note added successfully'
  });
});

module.exports = {
  applyForInternship,
  getStudentApplications,
  getApplicationDetails,
  withdrawApplication,
  updateApplication,
  getApplicationStats,
  addNote
};
