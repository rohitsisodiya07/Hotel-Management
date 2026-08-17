const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
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

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            default: "user",
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpire: {
            type: Date,
            default: null,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

const SignupModel = mongoose.model("signupUser", signupSchema);

module.exports = SignupModel;