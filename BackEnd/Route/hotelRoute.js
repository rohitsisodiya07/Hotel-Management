const express = require("express");
const router = express.Router();

const hotelController = require("../Controller/hotelController");

const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");

// ==========================
// Admin
// ==========================

// Create Hotel
router.post(
    "/create",
    auth,
    admin,
    hotelController.createHotel
);

// My Hotels
router.get(
    "/my-hotels",
    auth,
    admin,
    hotelController.getMyHotels
);

// Update Hotel
router.patch(
    "/update/:id",
    auth,
    admin,
    hotelController.updateHotel
);

// Change Active / Inactive
router.patch(
    "/change-status/:id",
    auth,
    admin,
    hotelController.changeHotelStatus
);

// Active Hotels
router.get(
    "/active",
    auth,
    admin,
    hotelController.getActiveHotels
);

// Inactive Hotels
router.get(
    "/inactive",
    auth,
    admin,
    hotelController.getInactiveHotels
);

// ==========================
// Admin + Super Admin
// ==========================

// Pending Hotels
router.get(
    "/pending",
    auth,
    adminOrSuperAdmin,
    hotelController.getPendingHotels
);

// Approved Hotels
router.get(
    "/approved",
    auth,
    adminOrSuperAdmin,
    hotelController.getApprovedHotels
);

// Rejected Hotels
router.get(
    "/rejected",
    auth,
    adminOrSuperAdmin,
    hotelController.getRejectedHotels
);

// ==========================
// Super Admin
// ==========================

// Approve Hotel
router.patch(
    "/approve/:id",
    auth,
    superAdmin,
    hotelController.approveHotel
);

// Reject Hotel
router.patch(
    "/reject/:id",
    auth,
    superAdmin,
    hotelController.rejectHotel
);

// ==========================
// Public
// ==========================

// Check Status
router.post(
    "/checkStatus",
    hotelController.checkHotelStatus
);

// ==========================
// 💥 Approved Hotel Dashboard Portal
// ==========================

// Particular login hotel ka poora data secure tarike se fetch karne ke liye
router.get(
    "/particular-dashboard",
    auth, // ◄--- Sirf authorized logged-in hotels hi access kar payenge
    hotelController.getParticularHotelDashboard
);

// ==========================
// Common
// ==========================

// Hotel By Id
router.get(
    "/:id",
    auth,
    hotelController.getHotelById
);

// PUBLIC ROUTES (No Auth Required)
router.get("/public/all", hotelController.getAllPublicHotels);
router.get("/public/:id", hotelController.getPublicHotelById);

module.exports = router;