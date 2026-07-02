const express = require('express');
const router = express.Router();
const { getVideoSession, updateSessionStatus } = require('../controllers/videoController');
const verifyToken = require('../middleware/verifyToken');

router.get('/session/:appointmentId', verifyToken, getVideoSession);
router.put('/session/:appointmentId/status', verifyToken, updateSessionStatus);

module.exports = router;
