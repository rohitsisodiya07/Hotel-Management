const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        hotelName: {
            type: String,
            required: true,
            trim: true,
        },

        hotelEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            default: "", // Super Admin approval ke baad bcrypt hash hoga
        },

        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "signupUser",
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
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        hotelType: {
            type: String,
            enum: [
                "Hotel",
                "Resort",
                "Guest House",
                "Hostel",
                "Villa",
            ],
            default: "Hotel",
        },

        totalRooms: {
            type: Number,
            required: true,
            min: 1,
        },

        hotelImages: [
            {
                type: String,
            },
        ],

        amenities: [
            {
                type: String,
                trim: true,
            },
        ],

        trackingId: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },

        remark: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Hotel", hotelSchema);