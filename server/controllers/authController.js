const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { generateTokens, sendRefreshTokenCookie } = require('../utils/generateTokens');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc  Register user with email & password (immediate access, no OTP)
// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, year, semester, employeeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(409).json({ message: 'Email already registered. Please log in.' });
    }

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'student',
      rollNumber: rollNumber ? rollNumber.trim() : undefined,
      department: department ? department.trim() : undefined,
      year: year ? Number(year) : undefined,
      semester: semester ? Number(semester) : undefined,
      employeeId: employeeId ? employeeId.trim() : undefined,
      isVerified: true,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'Registration successful! Welcome to UniSphere.',
      accessToken,
      refreshToken,
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

// @desc  Google Sign-In / Sign-Up
// @route POST /api/auth/google
// @access Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, role, department, year, semester, rollNumber } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google ID token credential is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID ? [process.env.GOOGLE_CLIENT_ID] : undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // If token verification via client fails (e.g. mock or custom audience in dev), try tokeninfo endpoint as fallback
      try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (resp.ok) {
          payload = await resp.json();
        } else {
          return res.status(401).json({ message: 'Invalid Google token signature' });
        }
      } catch (err) {
        return res.status(401).json({ message: 'Google authentication failed: invalid token' });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Unable to extract verified email from Google account' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    }).select('+refreshToken');

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      user.isVerified = true;
      if (department && !user.department) user.department = department;
      if (rollNumber && !user.rollNumber) user.rollNumber = rollNumber;
      if (year && !user.year) user.year = Number(year);
      if (semester && !user.semester) user.semester = Number(semester);
    } else {
      // Create new user from Google
      user = new User({
        name: name || 'UniSphere Scholar',
        email: normalizedEmail,
        googleId,
        avatar: picture,
        role: role || 'student',
        department: department || undefined,
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        rollNumber: rollNumber || undefined,
        isVerified: true,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Google Sign-In successful! Welcome to UniSphere.',
      accessToken,
      refreshToken,
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

// @desc  Verify 6-digit OTP and complete signup
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit verification code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'No registration record found for this email.' });
    }

    if (user.isVerified) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      sendRefreshTokenCookie(res, refreshToken);

      return res.json({
        message: 'Account is already verified.',
        accessToken,
        refreshToken,
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
    }

    const record = await OtpVerification.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({ message: 'No active verification code found. Please request a new code.' });
    }

    // Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Rate limiting attempts (max 5)
    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(429).json({ message: 'Too many failed verification attempts. Please request a new code.' });
    }

    // Verify OTP string
    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      await record.save();
      const attemptsLeft = 5 - record.attempts;
      return res.status(400).json({
        message: `Invalid verification code. ${attemptsLeft > 0 ? `${attemptsLeft} attempt(s) remaining.` : 'Please request a new code.'}`,
      });
    }

    // OTP is valid - mark user verified
    user.isVerified = true;
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove consumed OTP
    await OtpVerification.deleteOne({ _id: record._id });

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Email verified successfully! Welcome to UniSphere.',
      accessToken,
      refreshToken,
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

// @desc  Resend 6-digit OTP
// @route POST /api/auth/resend-otp
// @access Public
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please sign in.' });
    }

    // Check cooldown (60 seconds)
    const existing = await OtpVerification.findOne({ email: normalizedEmail });
    if (existing && existing.lastSentAt) {
      const elapsedSeconds = (Date.now() - new Date(existing.lastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({ message: `Please wait ${remaining}s before requesting another verification code.` });
      }
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpVerification.deleteMany({ email: normalizedEmail });
    await OtpVerification.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    });

    await sendOtpEmail({
      to: normalizedEmail,
      name: user.name,
      otp,
    });

    res.json({ message: 'A new 6-digit verification code has been sent to your email.' });
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Mark user verified if was previously false
    if (!user.isVerified) {
      user.isVerified = true;
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
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
// @access Public (needs refresh cookie or body token)
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
// @access Private
const logout = async (req, res, next) => {
  try {
    if (req.user?._id) {
      const user = await User.findById(req.user._id).select('+refreshToken');
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
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
    const allowed = [
      'name',
      'phone',
      'avatar',
      'department',
      'year',
      'semester',
      'cgpa',
      'rollNumber',
      'github',
      'linkedin',
      'website',
      'bio',
      'skills',
      'employeeId',
      'designation',
      'officeLocation',
      'officeHours',
      'researchAreas',
    ];
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
      .select('_id name email rollNumber department year semester role isVerified')
      .sort({ name: 1 })
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  googleAuth,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  getUsers,
};
