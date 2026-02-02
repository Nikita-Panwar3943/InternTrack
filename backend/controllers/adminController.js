const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const SkillAssessment = require('../models/SkillAssessment');
const { catchAsync } = require('../utils/errorHandler');

// Get analytics
const getAnalytics = catchAsync(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalInternships = await Internship.countDocuments();
  const totalApplications = await Application.countDocuments();

  const activeInternships = await Internship.countDocuments({ 
    isActive: true, 
    isApproved: true 
  });

  const pendingInternships = await Internship.countDocuments({ 
    isApproved: false 
  });

  // Application status breakdown
  const applicationStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Skills distribution
  const skillsDistribution = await StudentProfile.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills.name',
        count: { $sum: 1 },
        averageScore: { $avg: '$skills.score' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Recent registrations
  const recentStudents = await User.find({ role: 'student' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email createdAt');

  // Top performing students
  const topStudents = await StudentProfile.aggregate([
    {
      $addFields: {
        totalScore: { $sum: '$skills.score' },
        skillsCount: { $size: '$skills' }
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.username': 1,
        'user.email': 1,
        totalScore: 1,
        skillsCount: 1
      }
    }
  ]);

  const analytics = {
    overview: {
      totalStudents,
      totalRecruiters,
      totalInternships,
      totalApplications,
      activeInternships,
      pendingInternships
    },
    applicationStats,
    skillsDistribution,
    recentStudents,
    topStudents
  };

  res.status(200).json({
    success: true,
    analytics
  });
});

// Get all students
const getAllStudents = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    skills,
    location
  } = req.query;

  // Build query
  const query = { role: 'student' };

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Find users
  const users = await User.find(query)
    .select('username email createdAt isActive')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  // Get profiles for these users
  const userIds = users.map(user => user._id);
  const profiles = await StudentProfile.find({ 
    user: { $in: userIds } 
  }).populate('user', 'username email');

  // Apply additional filters if provided
  let filteredProfiles = profiles;

  if (skills) {
    const skillsArray = skills.split(',');
    filteredProfiles = filteredProfiles.filter(profile =>
      profile.skills.some(skill =>
        skillsArray.some(s => skill.name.toLowerCase().includes(s.toLowerCase()))
      )
    );
  }

  if (location) {
    filteredProfiles = filteredProfiles.filter(profile =>
      profile.location && profile.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    students: filteredProfiles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get student details
const getStudentDetails = catchAsync(async (req, res) => {
  const student = await StudentProfile.findOne({ user: req.params.id })
    .populate('user', 'username email createdAt isActive')
    .populate('skills.endorsements', 'username email');

  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    });
  }

  // Get student's applications
  const applications = await Application.find({ student: req.params.id })
    .populate('internship', 'title company')
    .sort({ appliedAt: -1 });

  // Get student's assessments
  const assessments = await SkillAssessment.find({ student: req.params.id })
    .sort({ completedAt: -1 });

  res.status(200).json({
    success: true,
    student,
    applications,
    assessments
  });
});

// Get all internships
const getAllInternships = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    company
  } = req.query;

  // Build query
  const query = {};

  if (status === 'pending') {
    query.isApproved = false;
  } else if (status === 'approved') {
    query.isApproved = true;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (company) {
    query.company = { $regex: company, $options: 'i' };
  }

  const internships = await Internship.find(query)
    .populate('recruiter', 'username email')
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

// Approve internship
const approveInternship = catchAsync(async (req, res) => {
  const internship = await Internship.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true, runValidators: true }
  ).populate('recruiter', 'username email');

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  res.status(200).json({
    success: true,
    internship,
    message: 'Internship approved successfully'
  });
});

// Reject internship
const rejectInternship = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const internship = await Internship.findByIdAndUpdate(
    req.params.id,
    { 
      isApproved: false,
      isActive: false,
      rejectionReason: reason
    },
    { new: true, runValidators: true }
  ).populate('recruiter', 'username email');

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  res.status(200).json({
    success: true,
    internship,
    message: 'Internship rejected successfully'
  });
});

// Toggle user status
const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// Get all recruiters
const getAllRecruiters = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    company,
    isVerified
  } = req.query;

  // Build query
  const query = { role: 'recruiter' };

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('username email createdAt isActive')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const userIds = users.map(user => user._id);
  let profiles = await RecruiterProfile.find({ 
    user: { $in: userIds } 
  }).populate('user', 'username email');

  if (company) {
    profiles = profiles.filter(profile =>
      profile.company.toLowerCase().includes(company.toLowerCase())
    );
  }

  if (isVerified !== undefined) {
    profiles = profiles.filter(profile => profile.isVerified === (isVerified === 'true'));
  }

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    recruiters: profiles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Verify recruiter
const verifyRecruiter = catchAsync(async (req, res) => {
  const profile = await RecruiterProfile.findOneAndUpdate(
    { user: req.params.id },
    { isVerified: true },
    { new: true, runValidators: true }
  ).populate('user', 'username email');

  if (!profile) {
    return res.status(404).json({
      message: 'Recruiter profile not found'
    });
  }

  res.status(200).json({
    success: true,
    profile,
    message: 'Recruiter verified successfully'
  });
});

module.exports = {
  getAnalytics,
  getAllStudents,
  getStudentDetails,
  getAllInternships,
  approveInternship,
  rejectInternship,
  toggleUserStatus,
  getAllRecruiters,
  verifyRecruiter
};
