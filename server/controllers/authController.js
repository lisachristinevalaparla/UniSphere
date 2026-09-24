const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateTokens, sendRefreshTokenCookie } = require('../utils/generateTokens');

// @desc  Register user
// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, year, semester, employeeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      rollNumber,
      department,
      year,
      semester,
      employeeId,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save hashed refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        semester: user.semester,
        rollNumber: user.rollNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        semester: user.semester,
        rollNumber: user.rollNumber,
        cgpa: user.cgpa,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Refresh access token
// @route POST /api/auth/refresh
// @access Public (needs refresh cookie)
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
// @access Private
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @desc  Update profile
// @route PATCH /api/auth/me
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'department', 'year', 'semester', 'cgpa'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin/faculty)
// @route GET /api/auth/users
// @access Private
const getUsers = async (req, res, next) => {
  try {
    const { role = 'student', department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter)
      .select('_id name email rollNumber department year semester role')
      .sort({ name: 1 })
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateProfile, getUsers };
