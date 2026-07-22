const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "signupUser",
            required: true,
        },

        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "rooms",
            required: true,
        },

        roomPrice: {
            type: Number,
            required: true,
        },

        checkIn: {
            type: Date,
            required: true,
        },

        checkOut: {
            type: Date,
            required: true,
        },

        totalGuests: {
            type: Number,
            required: true,
            default: 1,
        },

        totalNights: {
            type: Number,
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        // Coupon
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },

        couponCode: {
            type: String,
            default: "",
        },

        discount: {
            type: Number,
            default: 0,
        },

        finalAmount: {
            type: Number,
            required: true,
        },

        bookingStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Cancelled",
                "Completed",
            ],
            default: "Pending",
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded",
            ],
            default: "Pending",
        },

        paymentMethod: {
            type: String,
            enum: [
                "Cash",
                "Online",
                "Razorpay",
                "Stripe",
            ],
            default: "Cash",
        },

        specialRequest: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);