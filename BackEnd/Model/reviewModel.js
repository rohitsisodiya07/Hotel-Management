const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {

        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true, // Ek booking par ek hi review
        },
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true, // Dashboard query fast karne ke liye
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "signupUser",
            required: true,
        },
        cleanliness: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        staff: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        location: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        valueForMoney: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        overallRating: {
            type: Number,
        },

        review: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.pre("save", async function () {

    const average =
        (
            this.cleanliness +
            this.staff +
            this.location +
            this.valueForMoney
        ) / 4;

    this.overallRating = Number(average.toFixed(1));

});

module.exports = mongoose.model("Review", reviewSchema);