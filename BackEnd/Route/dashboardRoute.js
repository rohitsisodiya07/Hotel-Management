const express = require("express");
const router = express.Router();

const dashboardController = require("../Controller/dashboardController");

const auth = require("../Middleware/authMiddleware");
const superAdmin = require("../Middleware/superAdmin");
const admin = require('../Middleware/admin')




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


// Super Admin Dashboard Excel Export
router.get(
    "/superAdmin/dashboard/export",
    auth,
    superAdmin,
    dashboardController.exportSuperAdminDashboard
);

// Admin Dashboard Excel Export
router.get(
    "/platform-analytics/export",
    auth,
    admin,
    dashboardController.exportPlatformAnalytics
);


module.exports = router;