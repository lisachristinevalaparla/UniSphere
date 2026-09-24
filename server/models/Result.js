const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
    },
    grade: { type: String, trim: true }, // e.g. 'A+', 'B', 'F'
    remarks: { type: String },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

// Compute grade before saving
resultSchema.pre('save', async function (next) {
  if (this.isModified('marksObtained')) {
    const Exam = require('./Exam');
    const exam = await Exam.findById(this.exam).select('totalMarks');
    if (exam) {
      const pct = (this.marksObtained / exam.totalMarks) * 100;
      if (pct >= 90) this.grade = 'A+';
      else if (pct >= 80) this.grade = 'A';
      else if (pct >= 70) this.grade = 'B';
      else if (pct >= 60) this.grade = 'C';
      else if (pct >= 50) this.grade = 'D';
      else this.grade = 'F';
    }
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
