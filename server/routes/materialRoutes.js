const express = require('express');
const router = express.Router();
const {
  uploadMaterial, getMaterials, getMaterial, downloadMaterial, deleteMaterial,
} = require('../controllers/materialController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/', protect, getMaterials);
router.post('/', protect, authorize('admin', 'faculty'), upload.single('file'), uploadMaterial);
router.get('/:id', protect, getMaterial);
router.get('/:id/download', protect, downloadMaterial);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteMaterial);

module.exports = router;
