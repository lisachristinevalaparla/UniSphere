const Exam = require('../models/Exam');
const Result = require('../models/Result');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');

// @desc  Create exam (admin)
// @route POST /api/exams
const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });

    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map((s) => s._id);
    if (studentIds.length) {
      await notify({
        recipients: studentIds,
        title: `Exam Scheduled: ${exam.title}`,
        message: `${exam.subject} exam is scheduled on ${new Date(exam.date).toLocaleDateString()} at ${exam.venue || 'TBD'}.`,
        type: 'exam',
        refModel: 'Exam',
        refId: exam._id,
        link: '/exams',
      });
    }

    res.status(201).json({ exam });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all exams
// @route GET /api/exams
const getExams = async (req, res, next) => {
  try {
    const { status, subject, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = new RegExp(subject, 'i');

    const exams = await Exam.find(filter)
      .populate('createdBy', 'name')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Exam.countDocuments(filter);
    res.json({ exams, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single exam
// @route GET /api/exams/:id
const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (error) {
    next(error);
  }
};

// @desc  Update exam (admin)
// @route PATCH /api/exams/:id
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete exam (admin)
// @route DELETE /api/exams/:id
const deleteExam = async (req, res, next) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Enter results (admin)
// @route POST /api/exams/:id/results
const enterResults = async (req, res, next) => {
  try {
    const { results } = req.body; // [{ studentId, marksObtained, remarks }]
    if (!Array.isArray(results)) return res.status(400).json({ message: 'results array required' });

    const ops = results.map((r) => ({
      updateOne: {
        filter: { exam: req.params.id, student: r.studentId },
        update: {
          $set: {
            marksObtained: r.marksObtained,
            remarks: r.remarks,
            enteredBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Result.bulkWrite(ops);

    // Notify students
    for (const r of results) {
      await notify({
        recipients: r.studentId,
        title: 'Exam Result Published',
        message: `Your result for the exam has been published. Marks: ${r.marksObtained}`,
        type: 'exam',
        link: '/exams/results',
      });
    }

    res.json({ message: 'Results entered successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my results (student)
// @route GET /api/exams/my-results
const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('exam', 'title subject examType date totalMarks')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ results });
  } catch (error) {
    next(error);
  }
};

// @desc  Get results for a specific exam (admin)
// @route GET /api/exams/:id/results
const getExamResults = async (req, res, next) => {
  try {
    const results = await Result.find({ exam: req.params.id })
      .populate('student', 'name rollNumber email department year')
      .sort({ marksObtained: -1 })
      .lean();
    res.json({ results });
  } catch (error) {
    next(error);
  }
};

module.exports = { createExam, getExams, getExam, updateExam, deleteExam, enterResults, getMyResults, getExamResults };
