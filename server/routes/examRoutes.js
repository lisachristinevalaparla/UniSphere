const express = require('express');
const router = express.Router();
const {
  createExam, getExams, getExam, updateExam, deleteExam,
  enterResults, getMyResults, getExamResults,
} = require('../controllers/examController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

router.get('/my-results', protect, authorize('student'), getMyResults);
router.get('/', protect, getExams);
router.post('/', protect, authorize('admin', 'faculty'), createExam);
router.get('/:id', protect, getExam);
router.patch('/:id', protect, authorize('admin', 'faculty'), updateExam);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteExam);
router.post('/:id/results', protect, authorize('admin', 'faculty'), enterResults);
router.get('/:id/results', protect, authorize('admin', 'faculty'), getExamResults);

module.exports = router;
