const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'rejected', 'selected', 'withdrawn'],
    default: 'applied'
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  resume: {
    url: String,
    filename: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite']
    },
    notes: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    givenAt: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

// Indexes for better performance (excluding those already in compound index)
applicationSchema.index({ recruiter: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Virtual for days since application
applicationSchema.virtual('daysSinceApplied').get(function() {
  const today = new Date();
  const appliedDate = new Date(this.appliedAt);
  const diffTime = today - appliedDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastUpdated
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
