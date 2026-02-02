const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'admin', 'recruiter'])
    .withMessage('Role must be student, admin, or recruiter'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Student profile validation
const validateStudentProfile = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  handleValidationErrors
];

// Internship validation
const validateInternship = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Internship title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('workType')
    .isIn(['onsite', 'remote', 'hybrid'])
    .withMessage('Work type must be onsite, remote, or hybrid'),
  
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('applicationDeadline')
    .isISO8601()
    .withMessage('Please provide a valid application deadline'),
  
  body('openings')
    .isInt({ min: 1 })
    .withMessage('Openings must be at least 1'),
  
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  
  handleValidationErrors
];

// Application validation
const validateApplication = [
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cover letter must be less than 1000 characters'),
  
  handleValidationErrors
];

// Skill assessment validation
const validateSkillAssessment = [
  body('skill')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required'),
  
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
  
  body('answers.*.selectedAnswer')
    .isInt({ min: 0 })
    .withMessage('Selected answer must be a non-negative integer'),
  
  handleValidationErrors
];

// Education validation
const validateEducation = [
  body('institution')
    .trim()
    .notEmpty()
    .withMessage('Institution name is required'),
  
  body('degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required'),
  
  body('field')
    .trim()
    .notEmpty()
    .withMessage('Field of study is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0 and 4'),
  
  handleValidationErrors
];

// Experience validation
const validateExperience = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateStudentProfile,
  validateInternship,
  validateApplication,
  validateSkillAssessment,
  validateEducation,
  validateExperience,
  handleValidationErrors
};
