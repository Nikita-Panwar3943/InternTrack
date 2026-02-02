const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const SkillAssessment = require('../models/SkillAssessment');
const Internship = require('../models/Internship');
const { catchAsync } = require('../utils/errorHandler');

// Get student profile
const getProfile = catchAsync(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id })
    .populate('skills.endorsements', 'username email');

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// Update student profile
const updateProfile = catchAsync(async (req, res) => {
  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// Add skill to profile
const addSkill = catchAsync(async (req, res) => {
  const { name, proficiency } = req.body;

  const profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  // Check if skill already exists
  const existingSkill = profile.skills.find(skill => 
    skill.name.toLowerCase() === name.toLowerCase()
  );

  if (existingSkill) {
    return res.status(400).json({
      message: 'Skill already exists in profile'
    });
  }

  // Add new skill
  profile.skills.push({ name, proficiency });
  await profile.save();

  res.status(201).json({
    success: true,
    skill: profile.skills[profile.skills.length - 1]
  });
});

// Update skill
const updateSkill = catchAsync(async (req, res) => {
  const { skillId } = req.params;
  const { proficiency, score } = req.body;

  const profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  const skill = profile.skills.id(skillId);

  if (!skill) {
    return res.status(404).json({
      message: 'Skill not found'
    });
  }

  if (proficiency) skill.proficiency = proficiency;
  if (score !== undefined) skill.score = score;
  if (score !== undefined) skill.lastAssessed = new Date();

  await profile.save();

  res.status(200).json({
    success: true,
    skill
  });
});

// Remove skill
const removeSkill = catchAsync(async (req, res) => {
  const { skillId } = req.params;

  const profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  profile.skills.pull(skillId);
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Skill removed successfully'
  });
});

// Get student's applications
const getApplications = catchAsync(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate('internship', 'title company location workType')
    .populate('recruiter', 'username email')
    .sort({ appliedAt: -1 });

  res.status(200).json({
    success: true,
    applications
  });
});

// Get skill assessments
const getSkillAssessments = catchAsync(async (req, res) => {
  const assessments = await SkillAssessment.find({ student: req.user._id })
    .sort({ completedAt: -1 });

  res.status(200).json({
    success: true,
    assessments
  });
});

// Browse internships
const browseInternships = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    location,
    workType,
    industry,
    skills,
    isPaid
  } = req.query;

  // Build query
  const query = {
    isActive: true,
    isApproved: true,
    applicationDeadline: { $gt: new Date() }
  };

  if (search) {
    query.$text = { $search: search };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (workType) {
    query.workType = workType;
  }

  if (industry) {
    query.industry = { $regex: industry, $options: 'i' };
  }

  if (skills) {
    const skillsArray = skills.split(',');
    query.skills = { $in: skillsArray };
  }

  if (isPaid !== undefined) {
    query.isPaid = isPaid === 'true';
  }

  const internships = await Internship.find(query)
    .populate('recruiter', 'username')
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

// Get internship details
const getInternshipDetails = catchAsync(async (req, res) => {
  const internship = await Internship.findById(req.params.id)
    .populate('recruiter', 'username email');

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  // Increment views
  internship.views += 1;
  await internship.save();

  res.status(200).json({
    success: true,
    internship
  });
});

// Get student stats
const getStats = catchAsync(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    return res.status(404).json({
      message: 'Student profile not found'
    });
  }

  const applications = await Application.find({ student: req.user._id });
  const assessments = await SkillAssessment.find({ student: req.user._id });

  const stats = {
    totalApplications: applications.length,
    shortlistedApplications: applications.filter(app => app.status === 'shortlisted').length,
    selectedApplications: applications.filter(app => app.status === 'selected').length,
    totalSkills: profile.skills.length,
    assessedSkills: profile.skills.filter(skill => skill.lastAssessed).length,
    averageSkillScore: profile.skills.length > 0 
      ? profile.skills.reduce((acc, skill) => acc + skill.score, 0) / profile.skills.length 
      : 0,
    totalAssessments: assessments.length,
    averageAssessmentScore: assessments.length > 0
      ? assessments.reduce((acc, assessment) => acc + assessment.score, 0) / assessments.length
      : 0
  };

  res.status(200).json({
    success: true,
    stats
  });
});

module.exports = {
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
};
