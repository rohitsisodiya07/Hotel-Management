const Temporary = require("../Model/temporaryModel");
const Room = require("../Model/roomsModel");
const Booking = require("../Model/bookingModel");

const holdRoom = async (req, res) => {
    try {
        console.log("========== HOLD API HIT ==========");
        const userId = req.user._id || req.user.id;

        let {
            roomId,
            checkIn,
            checkOut,
            totalGuests,
        } = req.body;

        // Required Fields
        if (!roomId || !checkIn || !checkOut || !totalGuests) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        // Room Check
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found.",
            });
        }

        // Room Active
        if (!room.isActive) {
            return res.status(400).json({
                success: false,
                message: "Room is inactive.",
            });
        }

        // Maintenance Check
        if (room.bookingStatus === "Maintenance") {
            return res.status(400).json({
                success: false,
                message: "Room is under maintenance.",
            });
        }

        // Guest Validation
        if (Number(totalGuests) > room.maxOccupancy) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${room.maxOccupancy} guests allowed.`,
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Date Validation
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out must be after check-in.",
            });
        }

        // Existing Temporary Hold
        const existingHold = await Temporary.findOne({
            roomId,
            expiresAt: { $gt: new Date() },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        });

        if (existingHold && existingHold.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Room is temporarily reserved by another user.",
            });
        }

        // Existing Booking Check
        const existingBooking = await Booking.findOne({
            roomId,
            bookingStatus: {
                $in: [
                    "Pending",
                    "Confirmed",
                    "Checked In",
                ],
            },
            checkIn: {
                $lt: checkOutDate,
            },
            checkOut: {
                $gt: checkInDate,
            },
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Room is already booked for selected dates.",
            });
        }

        // Same User Hold Exists
        if (existingHold && existingHold.userId.toString() === userId.toString()) {
            const HOLD_TIME = 10; // minutes

            existingHold.checkIn = checkInDate;
            existingHold.checkOut = checkOutDate;
            existingHold.totalGuests = totalGuests;
            existingHold.expiresAt = new Date(Date.now() + HOLD_TIME * 60 * 1000)

            await existingHold.save();

            return res.status(200).json({
                success: true,
                message: "Temporary reservation updated.",
                hold: existingHold,
            });
        }

        // Create Hold
        const HOLD_TIME = 10; // 10 minutes

        const hold = await Temporary.create({
            userId,
            hotelId: room.hotelId,
            roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalGuests,
            expiresAt: new Date(Date.now() + HOLD_TIME * 60 * 1000), // FIXED to 10 mins
        });
        console.log("========== HOLD API HIT ==========");
        console.log("Hold Created:", hold);

        return res.status(201).json({
            success: true,
            message: "Room reserved successfully for 10 minutes.",
            hold,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const cancelHold = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { holdId } = req.params;

        const hold = await Temporary.findOne({
            _id: holdId,
            userId,
        });

        if (!hold) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found.",
            });
        }

        // 🛑 Error Fixed: Removed undefined roomId and used holdId
        await Temporary.deleteOne({
            _id: holdId,
            userId,
        });

        return res.status(200).json({
            success: true,
            message: "Reservation cancelled successfully.",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    holdRoom,
    cancelHold
};