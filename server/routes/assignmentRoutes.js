const express = require('express');
const router = express.Router();
const {
  createAssignment, getAssignments, getAssignment, updateAssignment,
  deleteAssignment, submitAssignment, getSubmissions, gradeSubmission, downloadAttachment,
} = require('../controllers/assignmentController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/', protect, getAssignments);
router.post('/', protect, authorize('admin', 'faculty'), upload.array('attachments', 5), createAssignment);
router.get('/:id', protect, getAssignment);
router.patch('/:id', protect, authorize('admin', 'faculty'), updateAssignment);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteAssignment);
router.get('/:id/download/:fileIdx', protect, downloadAttachment);
router.post('/:id/submit', protect, authorize('student'), upload.array('files', 5), submitAssignment);
router.get('/:id/submissions', protect, authorize('admin', 'faculty'), getSubmissions);
router.patch('/:id/submissions/:subId', protect, authorize('admin', 'faculty'), gradeSubmission);

module.exports = router;
