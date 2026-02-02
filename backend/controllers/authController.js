const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const { catchAsync } = require('../utils/errorHandler');
const { sendTokenResponse } = require('../utils/jwt');

// Register user
const register = catchAsync(async (req, res) => {
  const { username, email, password, role = 'student', firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      message: 'User with this email or username already exists'
    });
  }

  // Create user
  const user = new User({
    username,
    email,
    password,
    role
  });

  await user.save();

  // Create profile based on role
  if (role === 'student') {
    const studentProfile = new StudentProfile({
      user: user._id,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    await studentProfile.save();
    user.profile = studentProfile._id;
  } else if (role === 'recruiter') {
    const recruiterProfile = new RecruiterProfile({
      user: user._id,
      firstName: firstName || '',
      lastName: lastName || '',
      company: '',
      position: '',
      industry: ''
    });
    await recruiterProfile.save();
    user.profile = recruiterProfile._id;
  }

  await user.save();

  sendTokenResponse(user, 201, res);
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      message: 'Your account has been deactivated'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Logout user
const logout = catchAsync(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
const getMe = catchAsync(async (req, res) => {
  let user = req.user;

  // Populate profile based on role
  if (user.role === 'student') {
    user = await User.findById(user._id).populate('profile');
  } else if (user.role === 'recruiter') {
    user = await User.findById(user._id).populate('profile');
  }

  res.status(200).json({
    success: true,
    user
  });
});

// Update password
const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: 'There is no user with that email'
    });
  }

  // Generate reset token (simplified version)
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In a real app, you would send an email here
  res.status(200).json({
    success: true,
    message: 'Password reset token sent to email',
    resetToken // Only for development
  });
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
};
