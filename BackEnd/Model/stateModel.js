const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
    {
        stateName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "signupUser",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("State", stateSchema);