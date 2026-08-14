const express = require("express");

const router = express.Router();

const districtController = require("../Controller/districtController");

const authMiddleware = require("../Middleware/authMiddleware");
const superAdminMiddleware = require("../Middleware/superAdmin");


// Create
router.post(
    "/create",
    authMiddleware,
    superAdminMiddleware,
    districtController.createDistrict
);


// Bulk Preview
router.post(
    "/bulk-preview",
    authMiddleware,
    superAdminMiddleware,
    districtController.bulkPreviewDistricts
);


// Bulk Import
router.post(
    "/bulk-import",
    authMiddleware,
    superAdminMiddleware,
    districtController.bulkImportDistricts
);


// Active
router.get(
    "/active",
    authMiddleware,
    superAdminMiddleware,
    districtController.getAllDistricts
);


// Inactive
router.get(
    "/inactive",
    authMiddleware,
    superAdminMiddleware,
    districtController.getInactiveDistricts
);


// Get One
router.get(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    districtController.getDistrictById
);


// Update
router.patch(
    "/update/:id",
    authMiddleware,
    superAdminMiddleware,
    districtController.updateDistrict
);


// Active -> Inactive
router.patch(
    "/inactive/:id",
    authMiddleware,
    superAdminMiddleware,
    districtController.inactiveDistrict
);


// Restore
router.patch(
    "/restore/:id",
    authMiddleware,
    superAdminMiddleware,
    districtController.restoreDistrict
);


// Permanent Delete
router.delete(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    districtController.deleteDistrict
);


module.exports = router;