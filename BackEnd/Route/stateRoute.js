const express = require("express");

const router = express.Router();

const stateController = require("../Controller/stateController");

const authMiddleware = require("../Middleware/authMiddleware");
const superAdminMiddleware = require("../Middleware/superAdmin");


// Create
router.post(
    "/create",
    authMiddleware,
    superAdminMiddleware,
    stateController.createState
);


// Bulk Preview
router.post(
    "/bulk-preview",
    authMiddleware,
    superAdminMiddleware,
    stateController.bulkPreviewStates
);


// Bulk Import
router.post(
    "/bulk-import",
    authMiddleware,
    superAdminMiddleware,
    stateController.bulkImportStates
);


// Get all active states
router.get(
    "/active",
    authMiddleware,
    superAdminMiddleware,
    stateController.getAllStates
);


// Get all inactive states
router.get(
    "/inactive",
    authMiddleware,
    superAdminMiddleware,
    stateController.getInactiveStates
);


// Get one state
router.get(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    stateController.getStateById
);


// Update state
router.patch(
    "/update/:id",
    authMiddleware,
    superAdminMiddleware,
    stateController.updateState
);


// Active -> Inactive
router.patch(
    "/inactive/:id",
    authMiddleware,
    superAdminMiddleware,
    stateController.inactiveState
);


// Inactive -> Active
router.patch(
    "/restore/:id",
    authMiddleware,
    superAdminMiddleware,
    stateController.restoreState
);


// Permanent delete
router.delete(
    "/:id",
    authMiddleware,
    superAdminMiddleware,
    stateController.deleteState
);


module.exports = router;