const express = require('express')
const router = express.Router();

const signupController = require('../Controller/signupController')
const auth = require('../Middleware/authMiddleware')

//Check Otp at Signup
router.post('/sendSignupOtp', signupController.sendSignupOtp);
router.post('/verifySignupOtp', signupController.verifySignupOtp);

// Existing Routes
router.post('/signup', signupController.signup);
router.post('/login', signupController.login);
router.post("/sendOtp", signupController.sendOtp);
router.post("/verifyOtp", signupController.verifyOtp)
router.patch("/forgotPassword", signupController.forgotPassword);
router.patch('/resetPassword', auth, signupController.resetPassword);

module.exports = router;