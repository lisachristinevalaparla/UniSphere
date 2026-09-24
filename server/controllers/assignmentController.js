const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');
const path = require('path');
const fs = require('fs');

// @desc  Create assignment (admin)
// @route POST /api/assignments
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subject, subjectCode, dueDate, totalMarks, targetYear, targetSemester, targetDepartment } = req.body;

    const attachments = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
    }));

    const assignment = await Assignment.create({
      title, description, subject, subjectCode, dueDate, totalMarks,
      targetYear, targetSemester, targetDepartment,
      createdBy: req.user._id,
      attachments,
    });

    // Notify all students
    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map((s) => s._id);
    if (studentIds.length) {
      await notify({
        recipients: studentIds,
        title: `New Assignment: ${title}`,
        message: `A new assignment has been posted for ${subject}. Due: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'assignment',
        refModel: 'Assignment',
        refId: assignment._id,
        link: `/assignments/${assignment._id}`,
      });
    }

    res.status(201).json({ assignment });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all assignments
// @route GET /api/assignments
const getAssignments = async (req, res, next) => {
  try {
    const { subject, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (status) filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Assignment.countDocuments(filter);

    // Attach submission status for students
    if (req.user.role === 'student') {
      const ids = assignments.map((a) => a._id);
      const submissions = await Submission.find({
        assignment: { $in: ids },
        student: req.user._id,
      }).select('assignment status marks').lean();

      const submissionMap = {};
      submissions.forEach((s) => { submissionMap[s.assignment.toString()] = s; });

      assignments.forEach((a) => {
        a.mySubmission = submissionMap[a._id.toString()] || null;
      });
    }

    res.json({ assignments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single assignment
// @route GET /api/assignments/:id
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let mySubmission = null;
    if (req.user.role === 'student') {
      mySubmission = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
    }

    res.json({ assignment, mySubmission });
  } catch (error) {
    next(error);
  }
};

// @desc  Update assignment (admin)
// @route PATCH /api/assignments/:id
const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ assignment });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete assignment (admin)
// @route DELETE /api/assignments/:id
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Submit assignment (student)
// @route POST /api/assignments/:id/submit
const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const isLate = new Date() > new Date(assignment.dueDate);

    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
    }));

    const existing = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    if (existing) {
      existing.files = files;
      existing.textContent = req.body.textContent;
      existing.submittedAt = new Date();
      existing.status = isLate ? 'late' : 'submitted';
      await existing.save();
      return res.json({ submission: existing });
    }

    const submission = await Submission.create({
      assignment: req.params.id,
      student: req.user._id,
      files,
      textContent: req.body.textContent,
      status: isLate ? 'late' : 'submitted',
    });

    res.status(201).json({ submission });
  } catch (error) {
    next(error);
  }
};

// @desc  Get submissions for assignment (admin)
// @route GET /api/assignments/:id/submissions
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name rollNumber email department year')
      .sort({ submittedAt: -1 });
    res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

// @desc  Grade submission (admin)
// @route PATCH /api/assignments/:id/submissions/:subId
const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.subId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

    await notify({
      recipients: submission.student,
      title: 'Assignment Graded',
      message: `Your submission has been graded. Marks: ${marks}`,
      type: 'assignment',
      link: `/assignments/${req.params.id}`,
    });

    res.json({ submission });
  } catch (error) {
    next(error);
  }
};

// @desc  Download assignment attachment
// @route GET /api/assignments/:id/download/:fileIdx
const downloadAttachment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const file = assignment.attachments[req.params.fileIdx];
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.download(file.path, file.originalName);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment, getAssignments, getAssignment, updateAssignment,
  deleteAssignment, submitAssignment, getSubmissions, gradeSubmission, downloadAttachment,
};
