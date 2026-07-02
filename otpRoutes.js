const express = require('express');
const router = express.Router();
const {
  sendRegistrationOTP, verifyRegistrationOTP,
  forgotPassword, verifyResetOTP, resetPassword
} = require('../controllers/otpController');

router.post('/send', sendRegistrationOTP);
router.post('/verify', verifyRegistrationOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
