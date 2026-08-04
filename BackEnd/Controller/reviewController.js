const Booking = require("../Model/bookingModel");
const Review = require("../Model/reviewModel");

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