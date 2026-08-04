const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware'); // Aapka auth middleware
const {
    getDashboardSummary,
    getPlatformAnalytics,
    getDropdownOptions,
    getSuperAdminDashboardAnalytics
} = require('../Controller/dashboardController');

// Route: GET /api/dashboard/summary (For Hotel Owners / Managers)
router.get('/summary', auth, getDashboardSummary);

// Route: GET /api/dashboard/platform-analytics (For Super Admin)
router.get('/platform-analytics', auth, getPlatformAnalytics);

// ==========================================
// 🌟 Super Admin Global Scope Analytics & Dropdowns
// ==========================================
router.get('/superAdmin/options', auth, getDropdownOptions);
router.get('/superAdmin/dashboard', auth, getSuperAdminDashboardAnalytics);

module.exports = router;