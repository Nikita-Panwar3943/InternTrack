const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { catchAsync } = require('../utils/errorHandler');

// Get all internships (public)
const getAllInternships = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    location,
    workType,
    industry,
    skills,
    isPaid,
    sortBy = 'postedAt',
    sortOrder = 'desc'
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

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const internships = await Internship.find(query)
    .populate('recruiter', 'username')
    .sort(sort)
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

// Get internship by ID (public)
const getInternshipById = catchAsync(async (req, res) => {
  const internship = await Internship.findById(req.params.id)
    .populate('recruiter', 'username email');

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  // Only show approved and active internships to public
  if (!internship.isApproved || !internship.isActive) {
    return res.status(404).json({
      message: 'Internship not available'
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

// Search internships (advanced search)
const searchInternships = catchAsync(async (req, res) => {
  const {
    keyword,
    location,
    workType,
    industry,
    skills,
    stipendMin,
    stipendMax,
    duration,
    isRemote,
    isPaid,
    experienceLevel,
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = {
    isActive: true,
    isApproved: true,
    applicationDeadline: { $gt: new Date() }
  };

  if (keyword) {
    query.$text = { $search: keyword };
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

  if (stipendMin || stipendMax) {
    query['stipendRange.min'] = {};
    if (stipendMin) query['stipendRange.min'].$gte = parseInt(stipendMin);
    if (stipendMax) query['stipendRange.max'] = {};
    if (stipendMax) query['stipendRange.max'].$lte = parseInt(stipendMax);
  }

  if (duration) {
    query.duration = { $regex: duration, $options: 'i' };
  }

  if (isRemote !== undefined) {
    query.workType = isRemote === 'true' ? { $in: ['remote', 'hybrid'] } : 'onsite';
  }

  if (isPaid !== undefined) {
    query.isPaid = isPaid === 'true';
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  const internships = await Internship.find(query)
    .populate('recruiter', 'username company')
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

// Get featured internships
const getFeaturedInternships = catchAsync(async (req, res) => {
  const { limit = 6 } = req.query;

  const internships = await Internship.find({
    isActive: true,
    isApproved: true,
    applicationDeadline: { $gt: new Date() }
  })
    .populate('recruiter', 'username company')
    .sort({ views: -1, postedAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    internships
  });
});

// Get internship statistics
const getInternshipStats = catchAsync(async (req, res) => {
  const totalInternships = await Internship.countDocuments({
    isActive: true,
    isApproved: true
  });

  const activeInternships = await Internship.countDocuments({
    isActive: true,
    isApproved: true,
    applicationDeadline: { $gt: new Date() }
  });

  const remoteInternships = await Internship.countDocuments({
    isActive: true,
    isApproved: true,
    workType: { $in: ['remote', 'hybrid'] }
  });

  const paidInternships = await Internship.countDocuments({
    isActive: true,
    isApproved: true,
    isPaid: true
  });

  // Top industries
  const topIndustries = await Internship.aggregate([
    { $match: { isActive: true, isApproved: true } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Top locations
  const topLocations = await Internship.aggregate([
    { $match: { isActive: true, isApproved: true } },
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const stats = {
    totalInternships,
    activeInternships,
    remoteInternships,
    paidInternships,
    topIndustries,
    topLocations
  };

  res.status(200).json({
    success: true,
    stats
  });
});

// Get similar internships
const getSimilarInternships = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  const internship = await Internship.findById(id);

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found'
    });
  }

  // Find similar internships based on skills, industry, and location
  const query = {
    _id: { $ne: id },
    isActive: true,
    isApproved: true,
    applicationDeadline: { $gt: new Date() },
    $or: [
      { industry: internship.industry },
      { location: internship.location },
      { skills: { $in: internship.skills } }
    ]
  };

  const similarInternships = await Internship.find(query)
    .populate('recruiter', 'username company')
    .sort({ postedAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    internships: similarInternships
  });
});

module.exports = {
  getAllInternships,
  getInternshipById,
  searchInternships,
  getFeaturedInternships,
  getInternshipStats,
  getSimilarInternships
};
