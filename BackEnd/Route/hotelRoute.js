const express = require("express");
const router = express.Router();

const hotelController = require("../Controller/hotelController");

const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");

// ==========================
// 🟢 PUBLIC ROUTES (No Auth Required - MUST BE AT THE TOP)
// ==========================
router.get("/public/all", hotelController.getAllPublicHotels);
router.get("/public/:id", hotelController.getPublicHotelById);

// Check Status (Public)
router.post("/checkStatus", hotelController.checkHotelStatus);


// ==========================
// Admin
// ==========================
router.post(
    "/create",
    auth,
    admin,
    hotelController.createHotel
);

router.get(
    "/my-hotels",
    auth,
    admin,
    hotelController.getMyHotels
);

router.patch(
    "/update/:id",
    auth,
    admin,
    hotelController.updateHotel
);

router.patch(
    "/change-status/:id",
    auth,
    admin,
    hotelController.changeHotelStatus
);

router.get(
    "/active",
    auth,
    admin,
    hotelController.getActiveHotels
);

router.get(
    "/inactive",
    auth,
    admin,
    hotelController.getInactiveHotels
);


// ==========================
// Admin + Super Admin
// ==========================
router.get(
    "/pending",
    auth,
    adminOrSuperAdmin,
    hotelController.getPendingHotels
);

router.get(
    "/approved",
    auth,
    adminOrSuperAdmin,
    hotelController.getApprovedHotels
);

router.get(
    "/rejected",
    auth,
    adminOrSuperAdmin,
    hotelController.getRejectedHotels
);


// ==========================
// Super Admin
// ==========================
router.patch(
    "/approve/:id",
    auth,
    superAdmin,
    hotelController.approveHotel
);

router.patch(
    "/reject/:id",
    auth,
    superAdmin,
    hotelController.rejectHotel
);


// ==========================
// 💥 Approved Hotel Dashboard Portal
// ==========================
router.get(
    "/particular-dashboard",
    auth,
    hotelController.getParticularHotelDashboard
);

router.get("/all", auth, hotelController.getAllHotels);


// ==========================
// Common (Protected Parameter Route)
// ==========================
router.get(
    "/:id",
    auth,
    hotelController.getHotelById
);

module.exports = router;