const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        couponCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true, // Auto uppercase code
        },
        discountType: {
            type: String,
            enum: ["Percentage", "Fixed Amount"],
            default: "Percentage",
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minBookingAmount: {
            type: Number,
            default: 0, // Is amount se upar hi coupon lagega
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        maxUses: {
            type: Number,
            default: 100, // Total kitni baar use ho sakta hai
        },
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