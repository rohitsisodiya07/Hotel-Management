const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        // Coupon Code
        couponCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        // Discount Type
        discountType: {
            type: String,
            enum: ["Percentage", "Fixed Amount"],
            default: "Percentage",
        },

        // Discount Value
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        // Maximum Discount
        // Mainly useful for Percentage coupons
        maxDiscount: {
            type: Number,
            default: null,
            min: 0,
        },

        // Minimum Booking Amount
        minBookingAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Coupon Start Date
        startDate: {
            type: Date,
            default: Date.now,
        },

        // Coupon Expiry Date
        expiryDate: {
            type: Date,
            required: true,
        },

        // Total Usage Limit
        maxUses: {
            type: Number,
            default: 100,
            min: 1,
        },

        // Number of Times Used
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Status
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Coupon", couponSchema);
