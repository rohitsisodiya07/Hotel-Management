const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
    {
        name: {
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

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
            ],
            default:
                "Pending",
        },

        trackingId: {
            type: String,
            required: true,
            unique: true,
        },

        remark: {
            type: String,
            default: "",
        },

        otp: {
            type: String,
            default: "",
        },

        otpExpire: {
            type: Date,
            default: null,
        },
        profileImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AdminRequest", adminRequestSchema);