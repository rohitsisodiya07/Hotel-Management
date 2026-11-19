const Booking = require("../Model/bookingModel");
const Review = require("../Model/reviewModel");
const Hotel = require("../Model/hotelModel");
const mongoose = require("mongoose");

exports.createReview = async (req, res) => {
    try {
        const {
            bookingId,
            cleanliness,
            staff,
            location,
            valueForMoney,
            review,
        } = req.body;

        // 1. Check required fields
        if (
            !bookingId ||
            cleanliness === undefined ||
            staff === undefined ||
            location === undefined ||
            valueForMoney === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All rating fields are required.",
            });
        }

        // 2. Find booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        // 3. Only booking owner can review
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to review this booking.",
            });
        }

        // 4. Booking must be completed
        if (booking.bookingStatus !== "Completed") {
            return res.status(400).json({
                success: false,
                message: "You can review only after completing your stay.",
            });
        }

        // 5. Check duplicate review
        const alreadyReviewed = await Review.findOne({ bookingId });

        if (alreadyReviewed || booking.isReviewed) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted for this booking.",
            });
        }

        // 6. Create Review (Pre-save hook will automatically calculate overallRating)
        const newReview = await Review.create({
            bookingId,
            hotelId: booking.hotelId,
            userId: booking.userId,
            cleanliness,
            staff,
            location,
            valueForMoney,
            review: review ? review.trim() : "",
        });

        // 7. Update Booking status to mark as reviewed
        booking.isReviewed = true;
        booking.review = newReview._id;
        await booking.save();

        // 8. Update Hotel aggregate rating
        try {
            const allHotelReviews = await Review.find({ hotelId: booking.hotelId });
            const totalCount = allHotelReviews.length;
            const avgRating = totalCount > 0
                ? Number((allHotelReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / totalCount).toFixed(1))
                : 0;

            await Hotel.findByIdAndUpdate(booking.hotelId, {
                rating: avgRating,
                totalReviews: totalCount,
            });
        } catch (ratingErr) {
            console.error("Failed to update hotel rating cache:", ratingErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            data: newReview,
        });

    } catch (error) {
        console.error("Create Review Server Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit review due to server error.",
            error: error.message,
        });
    }
};

exports.getHotelReviews = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required." });
        }

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(Number(limit) || 10, 50));
        const skip = (pageNum - 1) * limitNum;

        const totalReviews = await Review.countDocuments({ hotelId });
        const reviews = await Review.find({ hotelId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Calculate Category Breakdown
        const allReviews = await Review.find({ hotelId }).select("cleanliness staff location valueForMoney overallRating");
        const count = allReviews.length;

        let breakdown = {
            cleanliness: 0,
            staff: 0,
            location: 0,
            valueForMoney: 0,
            overall: 0,
            total: count,
        };

        if (count > 0) {
            const sum = allReviews.reduce(
                (acc, r) => ({
                    cleanliness: acc.cleanliness + (r.cleanliness || 0),
                    staff: acc.staff + (r.staff || 0),
                    location: acc.location + (r.location || 0),
                    valueForMoney: acc.valueForMoney + (r.valueForMoney || 0),
                    overall: acc.overall + (r.overallRating || 0),
                }),
                { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0, overall: 0 }
            );

            breakdown = {
                cleanliness: Number((sum.cleanliness / count).toFixed(1)),
                staff: Number((sum.staff / count).toFixed(1)),
                location: Number((sum.location / count).toFixed(1)),
                valueForMoney: Number((sum.valueForMoney / count).toFixed(1)),
                overall: Number((sum.overall / count).toFixed(1)),
                total: count,
            };
        }

        return res.status(200).json({
            success: true,
            totalReviews,
            page: pageNum,
            totalPages: Math.ceil(totalReviews / limitNum) || 1,
            breakdown,
            reviews,
        });
    } catch (error) {
        console.error("Get Hotel Reviews Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve hotel reviews.",
            error: error.message,
        });
    }
};