const express = require('express');
const router = express.Router();
const {
  chatAssistant,
  summarizeDocument,
  generateStudyPlan,
  placementPrep,
} = require('../controllers/aiController');
const protect = require('../middleware/protect');
const upload = require('../middleware/upload');

// All AI routes require authentication
router.use(protect);

router.post('/chat', chatAssistant);
router.post('/summarize', upload.single('file'), summarizeDocument);
router.post('/study-plan', generateStudyPlan);
router.post('/placement-prep', placementPrep);

module.exports = router;
