const express = require("express");
const router = express.Router();

const hotelController = require('../Controller/hotelController');

router.post('/create', hotelController.createHotel);

router.get("/pending", hotelController.getPendingHotels);

router.patch("/approve/:id", hotelController.approveHotel);

router.patch("/reject/:id", hotelController.rejectHotel);

router.get("/rejected", hotelController.getRejectedHotels);

module.exports = router