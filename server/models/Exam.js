const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    subjectCode: { type: String, trim: true },
    examType: {
      type: String,
      enum: ['midterm', 'final', 'quiz', 'internal', 'practical', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: { type: String }, // "09:00"
    endTime: { type: String },   // "12:00"
    venue: { type: String, trim: true },
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    targetYear: { type: Number },
    targetSemester: { type: Number },
    targetDepartment: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructions: { type: String },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
