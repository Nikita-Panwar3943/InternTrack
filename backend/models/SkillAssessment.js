const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const skillAssessmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number // in seconds
  }],
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  recommendations: [{
    type: String,
    trim: true
  }],
  nextAssessmentDate: {
    type: Date
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Virtual for duration in minutes
skillAssessmentSchema.virtual('durationInMinutes').get(function() {
  return Math.round(this.timeTaken / 60);
});

// Virtual for accuracy percentage
skillAssessmentSchema.virtual('accuracyPercentage').get(function() {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Indexes for better performance
skillAssessmentSchema.index({ student: 1 });
skillAssessmentSchema.index({ skill: 1 });
skillAssessmentSchema.index({ score: -1 });
skillAssessmentSchema.index({ completedAt: -1 });

// Compound index to track student's progress in each skill
skillAssessmentSchema.index({ student: 1, skill: 1, completedAt: -1 });

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);
