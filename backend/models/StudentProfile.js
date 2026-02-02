const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastAssessed: {
    type: Date
  },
  endorsements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  field: {
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
  current: {
    type: Boolean,
    default: false
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  }
});

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
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
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
});

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  resume: {
    url: String,
    filename: String,
    uploadedAt: Date
  },
  skills: [skillSchema],
  education: [educationSchema],
  experience: [experienceSchema],
  portfolio: [{
    title: String,
    description: String,
    url: String,
    technologies: [String]
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'remote']
    }],
    locations: [String],
    industries: [String]
  },
  stats: {
    applicationsCount: {
      type: Number,
      default: 0
    },
    shortlistedCount: {
      type: Number,
      default: 0
    },
    selectedCount: {
      type: Number,
      default: 0
    },
    skillsAssessedCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Virtual for full name
studentProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for better performance (excluding unique fields)
studentProfileSchema.index({ 'skills.name': 1 });
studentProfileSchema.index({ location: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
