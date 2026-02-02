const RecruiterProfile = require('../models/RecruiterProfile');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler');

// Get recruiter profile
const getProfile = catchAsync(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Recruiter profile not found'
    });
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// Update recruiter profile
const updateProfile = catchAsync(async (req, res) => {
  const profile = await RecruiterProfile.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!profile) {
    return res.status(404).json({
      message: 'Recruiter profile not found'
    });
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// Create internship
const createInternship = catchAsync(async (req, res) => {
  const internshipData = {
    ...req.body,
    recruiter: req.user._id,
    isApproved: true  // Auto-approve recruiter internships
  };

  const internship = new Internship(internshipData);
  await internship.save();

  // Update recruiter stats
  await RecruiterProfile.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { 'stats.internshipsPosted': 1 } }
  );

  res.status(201).json({
    success: true,
    internship
  });
});

// Get recruiter's internships
const getInternships = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search
  } = req.query;

  // Build query
  const query = { recruiter: req.user._id };

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  } else if (status === 'pending') {
    query.isApproved = false;
  } else if (status === 'approved') {
    query.isApproved = true;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const internships = await Internship.find(query)
    .sort({ postedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Internship.countDocuments(query);

  res.status(200).json({
    success: true,
    internships,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Update internship
const updateInternship = catchAsync(async (req, res) => {
  const internship = await Internship.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found or you do not have permission to update it'
    });
  }

  res.status(200).json({
    success: true,
    internship
  });
});

// Delete internship
const deleteInternship = catchAsync(async (req, res) => {
  const internship = await Internship.findOneAndDelete({
    _id: req.params.id,
    recruiter: req.user._id
  });

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found or you do not have permission to delete it'
    });
  }

  // Also delete all applications for this internship
  await Application.deleteMany({ internship: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Internship deleted successfully'
  });
});

// Get applicants for an internship
const getApplicants = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status
  } = req.query;

  // Verify internship belongs to recruiter
  const internship = await Internship.findOne({
    _id: req.params.internshipId,
    recruiter: req.user._id
  });

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found or you do not have permission to view applicants'
    });
  }

  // Build query
  const query = { internship: req.params.internshipId };

  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('student', 'username email')
    .populate({
      path: 'student',
      populate: {
        path: 'profile',
        model: 'StudentProfile'
      }
    })
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

// Update application status
const updateApplicationStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;

  // Find application and verify internship belongs to recruiter
  const application = await Application.findById(req.params.applicationId)
    .populate('internship');

  if (!application || application.internship.recruiter.toString() !== req.user._id.toString()) {
    return res.status(404).json({
      message: 'Application not found or you do not have permission to update it'
    });
  }

  // Update status
  application.status = status;

  // Add note if provided
  if (notes) {
    application.notes.push({
      author: req.user._id,
      content: notes,
      createdAt: new Date()
    });
  }

  await application.save();

  // Update student stats if status changed to selected
  if (status === 'selected') {
    const StudentProfile = require('../models/StudentProfile');
    await StudentProfile.findOneAndUpdate(
      { user: application.student },
      { $inc: { 'stats.selectedCount': 1 } }
    );

    // Update recruiter stats
    await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { 'stats.candidatesHired': 1 } }
    );
  }

  res.status(200).json({
    success: true,
    application,
    message: `Application status updated to ${status}`
  });
});

// Get all applicants across all internships
const getAllApplicants = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    internshipId
  } = req.query;

  // Build query
  const query = { recruiter: req.user._id };

  if (status) {
    query.status = status;
  }

  if (internshipId) {
    query.internship = internshipId;
  }

  // Get applications for recruiter's internships
  const applications = await Application.find(query)
    .populate('student', 'username email')
    .populate('internship', 'title company')
    .populate({
      path: 'student',
      populate: {
        path: 'profile',
        model: 'StudentProfile'
      }
    })
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

// Get recruiter stats
const getStats = catchAsync(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Recruiter profile not found'
    });
  }

  const internships = await Internship.find({ recruiter: req.user._id });
  const applications = await Application.find({ recruiter: req.user._id });

  const stats = {
    totalInternships: internships.length,
    activeInternships: internships.filter(i => i.isActive).length,
    pendingInternships: internships.filter(i => !i.isApproved).length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'applied').length,
    shortlistedApplications: applications.filter(a => a.status === 'shortlisted').length,
    selectedApplications: applications.filter(a => a.status === 'selected').length,
    totalViews: internships.reduce((acc, i) => acc + i.views, 0),
    ...profile.stats
  };

  res.status(200).json({
    success: true,
    stats
  });
});

// Schedule interview
const scheduleInterview = catchAsync(async (req, res) => {
  const { date, time, location, type, notes } = req.body;

  const application = await Application.findById(req.params.applicationId)
    .populate('internship');

  if (!application || application.internship.recruiter.toString() !== req.user._id.toString()) {
    return res.status(404).json({
      message: 'Application not found or you do not have permission to update it'
    });
  }

  application.interviewSchedule = {
    date,
    time,
    location,
    type,
    notes
  };

  application.status = 'interview';
  await application.save();

  res.status(200).json({
    success: true,
    application,
    message: 'Interview scheduled successfully'
  });
});

module.exports = {
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
};
