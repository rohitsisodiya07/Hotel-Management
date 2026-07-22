const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        // Hotel Reference
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },

        // Room Number
        roomNumber: {
            type: String,
            required: true,
            trim: true,
        },

        // Room Type
        roomType: {
            type: String,
            enum: [
                "Standard",
                "Deluxe",
                "Super Deluxe",
                "Suite",
                "Family Room",
            ],
            required: true,
        },

        // Price
        pricePerNight: {
            type: Number,
            required: true,
            min: 0,
        },

        // Maximum Guests
        maxOccupancy: {
            type: Number,
            required: true,
            default: 2,
        },

        // Total Beds
        totalBeds: {
            type: Number,
            required: true,
            default: 1,
        },

        // Bed Type
        bedType: {
            type: String,
            enum: [
                "Single",
                "Double",
                "Queen",
                "King",
            ],
            default: "Double",
        },

        // Room Size
        roomSize: {
            type: Number,
            default: 0, // Square Feet
        },

        // Description
        description: {
            type: String,
            default: "",
            trim: true,
        },

        // Amenities
        roomAmenities: {
            type: [String],
            default: [],
        },

        // Images
        roomImages: {
            type: [String],
            validate: {
                validator: (images) => images.length >= 2,
                message: "Minimum 2 images required",
            },
        },

        // Availability
        bookingStatus: {
            type: String,
            enum: [
                "Available",
                "Booked",
                "Maintenance",
            ],
            default: "Available",
        },

        // Featured Room
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Active / Inactive
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

roomSchema.index(
    {
        hotelId: 1,
        roomNumber: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("rooms", roomSchema);