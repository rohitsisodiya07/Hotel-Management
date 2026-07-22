const Booking = require('../Model/bookingModel');
const Room = require('../Model/roomsModel');
const Coupon = require('../Model/couponModel')


const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;

        let {
            roomId,
            checkIn,
            checkOut,
            totalGuests,
            couponCode,
            specialRequest,
        } = req.body;

        // Validation
        if (!roomId || !checkIn || !checkOut || !totalGuests) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        // Room Exists
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found.",
            });
        }

        // Active Room
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

        // Guests Validation
        if (Number(totalGuests) > room.maxOccupancy) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${room.maxOccupancy} guests allowed.`,
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out must be after check-in.",
            });
        }

        // Overlapping Booking Check
        const existingBooking = await Booking.findOne({
            roomId,
            bookingStatus: {
                $in: ["Pending", "Confirmed"],
            },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate },
                },
            ],
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Room is already booked for selected dates.",
            });
        }

        // Nights
        const milliseconds =
            checkOutDate.getTime() - checkInDate.getTime();

        const totalNights = Math.ceil(
            milliseconds / (1000 * 60 * 60 * 24)
        );

        // Amount
        const roomPrice = room.pricePerNight;

        const totalAmount = roomPrice * totalNights;

        let discount = 0;
        let finalAmount = totalAmount;
        let couponId = null;
        let appliedCouponCode = "";

        // Coupon (optional)
        if (couponCode) {
            const coupon = await Coupon.findOne({
                couponCode: couponCode.toUpperCase(),
                isActive: true,
            });

            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon code.",
                });
            }

            couponId = coupon._id;
            appliedCouponCode = coupon.couponCode;

            // Discount logic baad me add karenge
        }

        // Booking ID
        const bookingId =
            "BK" +
            Date.now() +
            Math.floor(Math.random() * 1000);

        // Create Booking
        const booking = await Booking.create({
            bookingId,

            userId,

            hotelId: room.hotelId,

            roomId,

            roomPrice,

            checkIn: checkInDate,

            checkOut: checkOutDate,

            totalGuests,

            totalNights,

            totalAmount,

            couponId,

            couponCode: appliedCouponCode,

            discount,

            finalAmount,

            specialRequest,
        });

        const result = await Booking.findById(booking._id)
            .populate("userId", "name email mobile")
            .populate("hotelId", "hotelName hotelEmail")
            .populate("roomId");

        return res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            booking: result,
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
    createBooking
}