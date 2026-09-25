const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    googleId: { type: String, trim: true },
    role: {
      type: String,
      enum: ['student', 'admin', 'faculty'],
      default: 'student',
    },
    // Student-specific fields
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    semester: { type: Number, min: 1, max: 12 },
    cgpa: { type: Number, min: 0, max: 10 },
    phone: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    skills: [{ type: String, trim: true }],
    // Admin/faculty info
    employeeId: { type: String, trim: true },
    designation: { type: String, trim: true, default: '' },
    officeLocation: { type: String, trim: true, default: '' },
    officeHours: { type: String, trim: true, default: '' },
    researchAreas: { type: String, trim: true, default: '' },
    // Verification status
    isVerified: { type: Boolean, default: true },
    // Token storage
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
