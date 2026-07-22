const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const roomController = require("../Controller/roomController");

// Basic
router.get("/myRooms", auth, roomController.getMyRooms);
router.post("/create", auth, roomController.createRoom);

// View, Update, Delete, Toggle
router.get("/view/:roomId", auth, roomController.viewRoom); // New View Route
router.put("/update/:roomId", auth, roomController.updateRoom);
router.delete("/delete/:roomId", auth, roomController.deleteRoom);
router.patch("/status/:roomId", auth, roomController.toggleRoomStatus);


router.get("/public/hotel/:hotelId", roomController.getPublicRoomsByHotel);

module.exports = router;