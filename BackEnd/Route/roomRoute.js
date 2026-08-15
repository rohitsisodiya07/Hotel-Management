const express = require("express");
const router = express.Router();

const auth = require("../Middleware/authMiddleware");
const roomController = require("../Controller/roomController");
const adminorHotels = require("../Middleware/adminOrHotel");


// ==========================
// ROOM
// ==========================

// Get My Rooms
router.get(
    "/myRooms",
    auth,
    roomController.getMyRooms
);


// Create Room
router.post(
    "/create",
    auth,
    roomController.createRoom
);


// ==========================
// BULK IMPORT
// ==========================

// Bulk Preview
router.post(
    "/bulk-preview",
    auth,
    adminorHotels,
    roomController.bulkPreviewRooms
);


// Bulk Import
router.post(
    "/bulk-import",
    auth,
    adminorHotels,
    roomController.bulkImportRooms
);

// Bulk Export
router.get(
    "/bulk-export",
    auth,
    adminorHotels,
    roomController.bulkExportRooms
);

// ==========================
// VIEW / UPDATE / DELETE
// ==========================

// View
router.get(
    "/view/:roomId",
    auth,
    roomController.viewRoom
);


// Update
router.put(
    "/update/:roomId",
    auth,
    roomController.updateRoom
);


// Delete
router.delete(
    "/delete/:roomId",
    auth,
    roomController.deleteRoom
);


// Toggle Status
router.patch(
    "/status/:roomId",
    auth,
    roomController.toggleRoomStatus
);


// ==========================
// PUBLIC
// ==========================

router.get(
    "/public/hotel/:hotelId",
    roomController.getPublicRoomsByHotel
);


module.exports = router; 