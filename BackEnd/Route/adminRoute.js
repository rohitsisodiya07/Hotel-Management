const express = require('express');

const router = express.Router();

const adminController = require('../Controller/adminController')

router.post('/create', adminController.createAdminRequest)

router.get("/pending", adminController.getPendingAdminRequests);

router.patch("/approve/:id", adminController.approveAdminRequest);

router.patch("/reject/:id", adminController.rejectAdminRequest);

router.post("/sendOtp", adminController.sendOtp);

router.post("/verifyOtp", adminController.verifyOtp);

router.get("/:id", adminController.getAdminById);

router.patch("/updateRequest/:id", adminController.updateRequest);

router.get("/rejected", adminController.getRejectedAdminRequests);


module.exports = router 