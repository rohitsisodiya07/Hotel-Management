const express = require("express");
const router = express.Router();

const hotelController = require('../Controller/hotelController');

router.post('/create', hotelController.createHotel);

router.get("/pending", hotelController.getPendingHotels);

router.patch("/approve/:id", hotelController.approveHotel);

router.patch("/reject/:id", hotelController.rejectHotel);

router.get("/rejected", hotelController.getRejectedHotels);

router.post("/sendOtp", hotelController.sendOtp);

router.post("/verifyOtp", hotelController.verifyOtp);

router.patch("/updateRequest/:id", hotelController.updateRequest);

router.get("/:id", hotelController.getHotelById);

module.exports = router