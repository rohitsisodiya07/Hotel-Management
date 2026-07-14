const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        cityName: {
            type: String,
            required: true,
            trim: true,
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "District",
            required: true,
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

module.exports = mongoose.model(
    "City",
    citySchema
);