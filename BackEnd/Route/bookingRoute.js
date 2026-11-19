const express = require('express');
const router = express.Router();

const authMiddleware = require('../Middleware/authMiddleware');
const bookingController = require('../Controller/bookingController');
const adminOrHotel = require('../Middleware/adminOrHotel');

// ==========================
// Customer Routes
// ==========================
router.post("/create", authMiddleware, bookingController.createBooking);
router.get("/myBookings", authMiddleware, bookingController.getMyBookings);
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);
router.get("/details/:bookingId", authMiddleware, bookingController.getBookingDetails);

// Cancel Booking - Accessible by both Customer and Hotel/Admin (supports PUT & PATCH)
router.put("/cancel/:bookingId", authMiddleware, bookingController.cancelBooking);
router.patch("/cancel/:bookingId", authMiddleware, bookingController.cancelBooking);

// ==========================
// Hotel / Admin Routes
// ==========================
router.get(
    "/hotelBookings",
    authMiddleware,
    adminOrHotel,
    bookingController.getHotelBookings
);
router.get(
    "/hotel-bookings",
    authMiddleware,
    adminOrHotel,
    bookingController.getHotelBookings
);

router.patch(
    "/confirm/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.confirmBooking
);
router.put(
    "/confirm/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.confirmBooking
);

router.patch(
    "/checkin/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.checkInBooking
);
router.put(
    "/checkin/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.checkInBooking
);

router.patch(
    "/complete/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.completeBooking
);
router.put(
    "/complete/:bookingId",
    authMiddleware,
    adminOrHotel,
    bookingController.completeBooking
);

// ==========================
// Public Routes
// ==========================
router.get(
    "/bookedDates/:roomId",
    bookingController.getBookedDates
);

module.exports = router;
