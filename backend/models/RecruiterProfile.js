const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
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
  companyLogo: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  socialLinks: {
    linkedin: String,
    website: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  stats: {
    internshipsPosted: {
      type: Number,
      default: 0
    },
    applicationsReceived: {
      type: Number,
      default: 0
    },
    candidatesHired: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Virtual for full name
recruiterProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for better performance (excluding unique fields)
recruiterProfileSchema.index({ company: 1 });
recruiterProfileSchema.index({ industry: 1 });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
