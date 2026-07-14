const express = require("express");

const router = express.Router();

const stateController = require("../Controller/stateController");

// Create
router.post("/create", stateController.createState);

// Get all active states
router.get("/active", stateController.getAllStates);

// Get all inactive states
router.get("/inactive", stateController.getInactiveStates);

// Get one state
router.get("/:id", stateController.getStateById);

// Update state
router.patch("/update/:id", stateController.updateState);

// Active -> Inactive
router.patch("/inactive/:id", stateController.inactiveState);

// Inactive -> Active
router.patch("/restore/:id", stateController.restoreState);

// Permanent delete
router.delete("/:id", stateController.deleteState);

module.exports = router;