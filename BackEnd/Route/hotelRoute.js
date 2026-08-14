const express = require("express");
const router = express.Router();

const hotelController = require("../Controller/hotelController");

const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");


// ==========================
// 🟢 PUBLIC ROUTES
// ==========================

router.get(
    "/public/all",
    hotelController.getAllPublicHotels
);

router.get(
    "/public/:id",
    hotelController.getPublicHotelById
);

router.post(
    "/checkStatus",
    hotelController.checkHotelStatus
);


// ==========================
// ADMIN
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
// ADMIN + SUPER ADMIN
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
// 📥 BULK IMPORT
// ==========================

// Preview Excel
router.post(
    "/bulk-preview",
    auth,
    adminOrSuperAdmin,
    hotelController.bulkPreviewHotels
);

// Confirm Import
router.post(
    "/bulk-import",
    auth,
    adminOrSuperAdmin,
    hotelController.bulkImportHotels
);


// ==========================
// SUPER ADMIN
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
// APPROVED HOTEL DASHBOARD
// ==========================

router.get(
    "/particular-dashboard",
    auth,
    hotelController.getParticularHotelDashboard
);

router.get(
    "/all",
    auth,
    hotelController.getAllHotels
);


// ==========================
// COMMON
// ==========================

router.get(
    "/:id",
    auth,
    hotelController.getHotelById
);

router.delete(
    "/delete/:id",
    auth,
    adminOrSuperAdmin,
    hotelController.deleteHotel
);

module.exports = router;