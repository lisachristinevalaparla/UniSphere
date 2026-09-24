const express = require('express');
const router = express.Router();
const {
  createPlacement, getPlacements, getPlacement, updatePlacement,
  deletePlacement, applyToPlacement, getApplications, updateApplicationStatus, getMyApplications,
} = require('../controllers/placementController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/', protect, getPlacements);
router.post('/', protect, authorize('admin', 'faculty'), createPlacement);
router.get('/:id', protect, getPlacement);
router.patch('/:id', protect, authorize('admin', 'faculty'), updatePlacement);
router.delete('/:id', protect, authorize('admin', 'faculty'), deletePlacement);
router.post('/:id/apply', protect, authorize('student'), upload.single('resume'), applyToPlacement);
router.get('/:id/applications', protect, authorize('admin', 'faculty'), getApplications);
router.patch('/:pId/applications/:appId', protect, authorize('admin', 'faculty'), updateApplicationStatus);

module.exports = router;
