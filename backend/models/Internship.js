const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  workType: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    required: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  stipend: {
    type: String,
    trim: true
  },
  stipendRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  openings: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  companyLogo: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry-level', 'intermediate', 'advanced'],
    default: 'entry-level'
  }
}, {
  timestamps: true
});

// Virtual for application status
internshipSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Virtual for days until deadline
internshipSchema.virtual('daysUntilDeadline').get(function() {
  const today = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better performance
internshipSchema.index({ recruiter: 1 });
internshipSchema.index({ company: 1 });
internshipSchema.index({ industry: 1 });
internshipSchema.index({ location: 1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ isApproved: 1 });
internshipSchema.index({ isActive: 1 });
internshipSchema.index({ applicationDeadline: 1 });
internshipSchema.index({ postedAt: -1 });

// Text search index
internshipSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Internship', internshipSchema);
