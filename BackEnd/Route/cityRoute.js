const express = require("express");

const router = express.Router();

const cityController = require("../Controller/cityController");

const authMiddleware = require("../Middleware/authMiddleware");
const superAdminMiddleware = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");

// Create
router.post(
    "/create",
    authMiddleware,
    superAdminMiddleware,
    cityController.createCity
);


// Bulk Preview
router.post(
    "/bulk-preview",
    authMiddleware,
    superAdminMiddleware,
    cityController.bulkPreviewCities
);


// Bulk Import
router.post(
    "/bulk-import",
    authMiddleware,
    superAdminMiddleware,
    cityController.bulkImportCities
);


// Active
// Active
router.get(
    "/active",
    authMiddleware,
    adminOrSuperAdmin,
    cityController.getAllCities
);

// Inactive
router.get(
    "/inactive",
    authMiddleware,
    adminOrSuperAdmin,
    cityController.getInactiveCities
);


// Get One
router.get(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    cityController.getCityById
);


// Update
router.patch(
    "/update/:id",
    authMiddleware,
    superAdminMiddleware,
    cityController.updateCity
);


// Active -> Inactive
router.patch(
    "/inactive/:id",
    authMiddleware,
    superAdminMiddleware,
    cityController.inactiveCity
);


// Inactive -> Active
router.patch(
    "/restore/:id",
    authMiddleware,
    superAdminMiddleware,
    cityController.restoreCity
);


// Permanent Delete
router.delete(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    cityController.deleteCity
);


module.exports = router;