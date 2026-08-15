const express = require("express");
const router = express.Router();

const dashboardController = require("../Controller/dashboardController");

const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const admin = require('../Middleware/admin');


// ==========================
// 📥 EXPORT ROUTES
// ==========================

// 1. Hotel Dashboard Summary Excel Export (Normal Hotel / Admin View)
router.get(
    "/summary/export",
    auth,
    dashboardController.exportDashboardSummary
);

// 2. Admin Dashboard Excel Export
router.get(
    "/platform-analytics/export",
    auth,
    admin,
    dashboardController.exportPlatformAnalytics
);

// 3. Super Admin Dashboard Excel Export
router.get(
    "/superAdmin/dashboard/export",
    auth,
    superAdmin,
    dashboardController.exportSuperAdminDashboard
);

// ==========================
// 📊 DATA ROUTES
// ==========================

// Dashboard Summary
router.get(
    "/summary",
    auth,
    dashboardController.getDashboardSummary
);

// Platform Analytics
router.get(
    "/platform-analytics",
    auth,
    dashboardController.getPlatformAnalytics
);

// Super Admin Options
router.get(
    "/superAdmin/options",
    auth,
    dashboardController.getDropdownOptions
);

// Super Admin Dashboard
router.get(
    "/superAdmin/dashboard",
    auth,
    dashboardController.getSuperAdminDashboardAnalytics
);

module.exports = router;