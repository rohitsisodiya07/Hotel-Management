const express = require('express');

const router = express.Router();

const adminController = require('../Controller/adminController');

// 🚀 New Email OTP Verification & Secure Admin Registration Flows
router.post('/sendAdminSignupOtp', adminController.sendAdminSignupOtp);
router.post('/verifyAndCreateAdmin', adminController.verifyAndCreateAdmin);

// Existing Routes
// router.post('/create', adminController.createAdminRequest);

router.get("/pending", adminController.getPendingAdminRequests);
router.get("/approved", adminController.getApprovedAdminRequests);
router.get("/rejected", adminController.getRejectedAdminRequests);

router.patch("/approve/:id", adminController.approveAdminRequest);
router.patch("/reject/:id", adminController.rejectAdminRequest);
router.patch("/updateRequest/:id", adminController.updateRequest);

router.post("/sendOtp", adminController.sendOtp);
router.post("/verifyOtp", adminController.verifyOtp);

router.get("/:id", adminController.getAdminById); // ✅ Last
module.exports = router;