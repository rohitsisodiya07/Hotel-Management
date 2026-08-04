const express = require('express');

const router = express.Router();

const adminController = require('../Controller/adminController');

// 🚀 New Email OTP Verification & Secure Admin Registration Flows
router.post('/sendAdminSignupOtp', adminController.sendAdminSignupOtp);
router.post('/verifyAndCreateAdmin', adminController.verifyAndCreateAdmin);

// Existing Routes
// router.post('/create', adminController.createAdminRequest);

router.get("/pending", adminController.getPendingAdminRequests);

// 👇 Added Approved Admin Requests Route
router.get("/approved", adminController.getApprovedAdminRequests);

router.patch("/approve/:id", adminController.approveAdminRequest);

router.patch("/reject/:id", adminController.rejectAdminRequest);

router.post("/sendOtp", adminController.sendOtp);

router.post("/verifyOtp", adminController.verifyOtp);

router.get("/:id", adminController.getAdminById);

router.patch("/updateRequest/:id", adminController.updateRequest);

router.get("/rejected", adminController.getRejectedAdminRequests);

module.exports = router;