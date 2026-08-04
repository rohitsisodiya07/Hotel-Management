const mongoose = require('mongoose');
const roomHoldSchema = new mongoose.Schema(
    {
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

        checkIn: {
            type: Date,
            required: true,
        },

        checkOut: {
            type: Date,
            required: true,
        },
        holdStatus: {
            type: String,
            enum: ["Active", "Expired"],
            default: "Active"
        },

        totalGuests: {
            type: Number,
            required: true,
            default: 1,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

roomHoldSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model('RoomHold', roomHoldSchema)