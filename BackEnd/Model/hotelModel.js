const mongoose = require("mongoose");


const hotelSchema = new mongoose.Schema(
    {
        hotelName: {
            type: String,
            required: true,
        },

        ownerName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        mobile: {
            type: String,
            required: true,
        },

        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        totalRooms: {
            type: Number,
            required: true,
        },

        // New fields
        hotelImage: {
            type: String,
            default: "",
        },

        ownerImage: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        hotelType: {
            type: String,
            enum: ["Hotel", "Resort", "Guest House", "Hostel"],
            default: "Hotel",
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },

        password: {
            type: String,
            default: "",
        },
        remark: {
            type: String,
            default: "",
        },
        trackingId: {
            type: String,
            unique: true,
            required: true,
        },
        otp: {
            type: String,
            default: "",
        },

        otpExpire: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Hotel", hotelSchema);