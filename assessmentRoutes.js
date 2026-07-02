const express = require('express');
const router = express.Router();
const {
  submitAssessment, getMyAssessments,
  getClientAssessments, getAssessmentById
} = require('../controllers/assessmentController');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, submitAssessment);
router.get('/my', verifyToken, getMyAssessments);
router.get('/client/:clientId', verifyToken, getClientAssessments);
router.get('/:id', verifyToken, getAssessmentById);

module.exports = router;
