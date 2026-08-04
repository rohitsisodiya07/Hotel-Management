const Booking = require('../Model/bookingModel');
const Room = require('../Model/roomsModel');
const Coupon = require('../Model/couponModel');
const Hotel = require('../Model/hotelModel'); // Hotel model require kiya gaya hai
const dayjs = require("dayjs");
const mongoose = require('mongoose');
const temporaryModel = require('../Model/temporaryModel');

const getAccessibleHotelIds = async (user) => {
    if (user.role === "hotel") {
        const hotel = await Hotel.findOne({ hotelEmail: user.email });

        if (!hotel) return [];

        return [hotel._id];
    }

    if (user.role === "admin") {
        const hotels = await Hotel.find({ adminId: user._id });

        return hotels.map(h => h._id);
    }

    return [];
};

//Create Booking
const createBooking = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const userId = req.user._id || req.user.id;

        let {
            roomId,
            checkIn,
            checkOut,
            totalGuests,
            couponCode,
            specialRequest,
        } = req.body;

        // Required Fields
        if (!roomId || !checkIn || !checkOut || !totalGuests) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory.",
            });
        }

        // Check Room
        const room = await Room.findById(roomId).session(session);

        if (!room) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Room not found.",
            });
        }

        // Room Active
        if (!room.isActive) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Room is inactive.",
            });
        }

        // Maintenance
        if (room.bookingStatus === "Maintenance") {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Room is under maintenance.",
            });
        }

        // Guest Validation
        if (Number(totalGuests) > room.maxOccupancy) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `Maximum ${room.maxOccupancy} guests allowed.`,
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Check-out must be after Check-in.",
            });
        }

        console.log("User:", userId);
        console.log("Room:", roomId);
        console.log("CheckIn:", checkInDate);
        console.log("CheckOut:", checkOutDate);

        // Check Temporary Hold
        const hold = await temporaryModel.find();

        console.log("All Holds:", hold);

        if (!hold || hold.length === 0) { // Added check for empty array
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Reservation expired. Please reserve again.",
            });
        }

        // Overlapping Booking
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
        }).session(session);

        if (existingBooking) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Room is already booked for selected dates.",
            });
        }

        // Total Nights
        const milliseconds =
            checkOutDate.getTime() - checkInDate.getTime();

        const totalNights = Math.ceil(
            milliseconds / (1000 * 60 * 60 * 24)
        );

        // Price
        const roomPrice = room.pricePerNight;
        const totalAmount = roomPrice * totalNights;

        let couponId = null;
        let appliedCouponCode = "";
        let discount = 0;
        let finalAmount = totalAmount;

        console.log(">>>>>couponCode", couponCode);

        // Coupon
        if (couponCode) {

            const coupon = await Coupon.findOne({
                couponCode: couponCode.trim().toUpperCase(),
                status: "Active",
            }).session(session);

            console.log(">>>>>>coupon", coupon);

            if (!coupon) {
                await session.abortTransaction();
                session.endSession();

                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon code.",
                });
            }

            if (
                coupon.expiryDate &&
                new Date(coupon.expiryDate) < new Date()
            ) {
                await session.abortTransaction();
                session.endSession();

                return res.status(400).json({
                    success: false,
                    message: "Coupon expired.",
                });
            }

            couponId = coupon._id;
            appliedCouponCode = coupon.couponCode;

            if (coupon.discountPercentage) {
                discount =
                    (totalAmount * coupon.discountPercentage) / 100;
            } else if (coupon.discountAmount) {
                discount = coupon.discountAmount;
            }

            if (discount > totalAmount) {
                discount = totalAmount;
            }

            finalAmount = totalAmount - discount;
        }

        // Booking Id
        const bookingId =
            "BK" +
            Date.now() +
            Math.floor(Math.random() * 1000);
        const [booking] = await Booking.create(
            [
                {
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
                    specialRequest: specialRequest || "",
                    bookingStatus: "Pending",
                    paymentStatus: "Pending",
                    paymentMethod: "Cash",
                },
            ],
            { session }
        );

        // Delete Temporary Hold
        await temporaryModel.deleteOne(
            {
                _id: hold[0]._id, // Fixed: passing the ID of the hold
            },
            { session }
        );

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        // Populate Booking Details
        const result = await Booking.findById(booking._id)
            .populate("userId", "name email mobile")
            .populate(
                "hotelId",
                "hotelName hotelEmail address city"
            )
            .populate("roomId");

        return res.status(201).json({
            success: true,
            message:
                "Booking request sent successfully. Waiting for hotel confirmation.",
            booking: result,
        });

    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// GET MY CURRENT BOOKINGS (For Customers)
// =========================================================================
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const bookings = await Booking.find({ userId })
            .populate("hotelId", "hotelName hotelImages address city hotelType")
            .populate("roomId", "roomNumber roomType pricePerNight roomImages")
            .populate("review") // ⭐ Added review population
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalBookings: bookings.length,
            bookings,
        });
    } catch (error) {
        console.log("Get My Bookings Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// GET BOOKING DETAILS BY ID (For Customer Modal Popup)
// =========================================================================
const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id || req.user.id;

        const booking = await Booking.findOne({
            _id: bookingId,
            userId: userId,
        })
            .populate("hotelId", "hotelName hotelEmail hotelImages address description hotelType amenities")
            .populate("roomId", "roomNumber roomType roomImages roomSize bedType totalBeds maxOccupancy pricePerNight description roomAmenities")
            .populate("userId", "name email mobile")
            .populate("review"); // ⭐ Added review population

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        return res.status(200).json({ success: true, booking });

    } catch (error) {
        console.log("Get Booking Details Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// GET BOOKINGS FOR LOGGED-IN HOTEL (New Addition)
// =========================================================================
const getHotelBookings = async (req, res) => {
    try {
        let hotelIds = [];

        // Hotel Login
        if (req.user.role === "hotel") {

            const hotel = await Hotel.findOne({
                hotelEmail: req.user.email,
            });

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: "Hotel not found.",
                });
            }

            hotelIds = [hotel._id];
        }

        // Admin Login
        else if (req.user.role === "admin") {

            const hotels = await Hotel.find({
                adminId: req.user._id,
            });

            if (hotels.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No hotels found.",
                });
            }

            hotelIds = hotels.map(hotel => hotel._id);
        }

        else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        const bookings = await Booking.find({
            hotelId: { $in: hotelIds },
        })
            .populate("hotelId", "hotelName hotelEmail")
            .populate("userId", "name email mobile")
            .populate("roomId", "roomNumber roomType pricePerNight roomImages")
            .populate("review") // ⭐ Added review population
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalBookings: bookings.length,
            bookings,
        });

    } catch (error) {
        console.error("Get Hotel Bookings Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// CONFIRM BOOKING
// =========================================================================
const confirmBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find Booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        // Hotel/Admin Permission
        const hotelIds = await getAccessibleHotelIds(req.user);

        const allowed = hotelIds.some(
            id => id.toString() === booking.hotelId.toString()
        );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        // Status Validations
        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled booking cannot be confirmed.",
            });
        }

        if (booking.bookingStatus === "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Booking is already confirmed.",
            });
        }

        if (booking.bookingStatus === "Checked In") {
            return res.status(400).json({
                success: false,
                message: "Guest has already checked in.",
            });
        }

        if (booking.bookingStatus === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Booking has already been completed.",
            });
        }

        // Update Status
        booking.bookingStatus = "Confirmed";
        await booking.save();

        // Return Updated Booking
        const result = await Booking.findById(booking._id)
            .populate("userId", "name email mobile")
            .populate("hotelId", "hotelName hotelEmail")
            .populate("roomId", "roomNumber roomType pricePerNight");

        return res.status(200).json({
            success: true,
            message: "Booking confirmed successfully.",
            booking: result,
        });

    } catch (error) {
        console.error("Confirm Booking Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// CHECK-IN BOOKING
// =========================================================================
const checkInBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find Booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        // Hotel/Admin Permission
        const hotelIds = await getAccessibleHotelIds(req.user);

        const allowed = hotelIds.some(
            id => id.toString() === booking.hotelId.toString()
        );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        // Status Validations
        if (booking.bookingStatus === "Pending") {
            return res.status(400).json({
                success: false,
                message: "Please confirm the booking first.",
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled booking cannot be checked in.",
            });
        }

        if (booking.bookingStatus === "Checked In") {
            return res.status(400).json({
                success: false,
                message: "Guest has already checked in.",
            });
        }

        if (booking.bookingStatus === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Booking has already been completed.",
            });
        }

        // Update Status
        booking.bookingStatus = "Checked In";
        await booking.save();

        // Return Updated Booking
        const result = await Booking.findById(booking._id)
            .populate("userId", "name email mobile")
            .populate("hotelId", "hotelName hotelEmail")
            .populate("roomId", "roomNumber roomType pricePerNight");

        return res.status(200).json({
            success: true,
            message: "Guest checked in successfully.",
            booking: result,
        });

    } catch (error) {
        console.error("Check-In Booking Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// COMPLETE BOOKING
// =========================================================================
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find Booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        // Hotel/Admin Permission
        const hotelIds = await getAccessibleHotelIds(req.user);

        const allowed = hotelIds.some(
            id => id.toString() === booking.hotelId.toString()
        );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        // Status Validations
        if (booking.bookingStatus === "Pending") {
            return res.status(400).json({
                success: false,
                message: "Booking is not confirmed yet.",
            });
        }

        if (booking.bookingStatus === "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Guest has not checked in yet.",
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled booking cannot be completed.",
            });
        }

        if (booking.bookingStatus === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Booking is already completed.",
            });
        }

        // Update Status
        booking.bookingStatus = "Completed";
        await booking.save();

        // Return Updated Booking
        const result = await Booking.findById(booking._id)
            .populate("userId", "name email mobile")
            .populate("hotelId", "hotelName hotelEmail")
            .populate("roomId", "roomNumber roomType pricePerNight");

        return res.status(200).json({
            success: true,
            message: "Booking completed successfully.",
            booking: result,
        });

    } catch (error) {
        console.error("Complete Booking Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Get Booked Dates

const getBookedDates = async (req, res) => {
    try {

        const { roomId } = req.params;

        const bookings = await Booking.find({
            roomId,
            bookingStatus: {
                $in: ["Pending", "Confirmed", "Checked In"]
            }
        }).select("checkIn checkOut");

        const bookedDates = [];

        bookings.forEach((booking) => {

            let current = dayjs(booking.checkIn);
            const checkOut = dayjs(booking.checkOut);

            while (current.isBefore(checkOut, "day")) {
                bookedDates.push(current.toDate());
                current = current.add(1, "day");
            }

        });

        return res.status(200).json({
            success: true,
            bookedDates,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


//Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id || req.user.id;
        const userRole = req.user.role;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        // Verify if user owns this booking OR is hotel/admin
        let isAllowed = false;
        if (booking.userId.toString() === userId.toString()) {
            isAllowed = true;
        } else if (userRole === "hotel" || userRole === "admin") {
            const hotelIds = await getAccessibleHotelIds(req.user);
            if (hotelIds.some(id => id.toString() === booking.hotelId.toString())) {
                isAllowed = true;
            }
        }

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to cancel this booking.",
            });
        }

        // 🛑 Rule 1: No one can cancel an already Completed or Cancelled booking
        if (["Completed", "Cancelled"].includes(booking.bookingStatus)) {
            return res.status(400).json({
                success: false,
                message: `Booking cannot be cancelled as it is already ${booking.bookingStatus}.`,
            });
        }

        // 🛑 Rule 2: Customer CANNOT cancel after 'Checked In' (Only Admin/Hotel can)
        if (booking.bookingStatus === "Checked In" && userRole === "user") {
            return res.status(400).json({
                success: false,
                message: "Customers cannot cancel a booking after Check-In. Please contact the hotel reception.",
            });
        }

        // Update Status and Reason
        booking.bookingStatus = "Cancelled";
        booking.cancelReason = userRole === "user" ? "Cancelled by customer" : "Cancelled by hotel management";

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            booking,
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingDetails,
    getHotelBookings, // Exported
    confirmBooking,
    checkInBooking,
    completeBooking,
    getBookedDates,
    cancelBooking
};