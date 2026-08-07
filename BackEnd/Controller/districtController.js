const DistrictModel = require("../Model/districtModel");
const StateModel = require("../Model/stateModel");

// Create
const createDistrict = async (req, res) => {
    try {
        const { districtName, stateId } = req.body;

        if (!districtName?.trim() || !stateId) {
            return res.status(400).json({
                success: false,
                message: "District name and State are required",
            });
        }

        const state = await StateModel.findById(stateId);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        const formattedDistrict = districtName.trim().toLowerCase();

        const existingDistrict = await DistrictModel.findOne({
            districtName: formattedDistrict,
            stateId,
        });

        if (existingDistrict) {
            return res.status(400).json({
                success: false,
                message: "District already exists in this state",
            });
        }

        const result = await DistrictModel.create({
            districtName: formattedDistrict,
            stateId,
        });

        return res.status(201).json({
            success: true,
            message: "District created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Active Districts with pagination & sorting
const getAllDistricts = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc" } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Active",
            districtName: {
                $regex: search,
                $options: "i",
            },
        };

        const result = await DistrictModel.find(query)
            .populate("stateId", "stateName")
            .sort({ districtName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await DistrictModel.countDocuments(query);

        return res.status(200).json({
            success: true,
            result,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Inactive Districts with pagination & sorting
const getInactiveDistricts = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc" } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Inactive",
            districtName: {
                $regex: search,
                $options: "i",
            },
        };

        const result = await DistrictModel.find(query)
            .populate("stateId", "stateName")
            .sort({ districtName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await DistrictModel.countDocuments(query);

        return res.status(200).json({
            success: true,
            result,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get One
const getDistrictById = async (req, res) => {
    try {
        const result = await DistrictModel.findById(req.params.id).populate(
            "stateId",
            "stateName"
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "District not found",
            });
        }

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update
const updateDistrict = async (req, res) => {
    try {
        const { districtName, stateId } = req.body;

        if (!districtName?.trim() || !stateId) {
            return res.status(400).json({
                success: false,
                message: "District name and State are required",
            });
        }

        const state = await StateModel.findById(stateId);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        const formattedDistrict = districtName.trim().toLowerCase();

        const existingDistrict = await DistrictModel.findOne({
            districtName: formattedDistrict,
            stateId,
            _id: { $ne: req.params.id },
        });

        if (existingDistrict) {
            return res.status(400).json({
                success: false,
                message: "District already exists in this state",
            });
        }

        const result = await DistrictModel.findByIdAndUpdate(
            req.params.id,
            {
                districtName: formattedDistrict,
                stateId,
            },
            { returnDocument: "after" }
        ).populate("stateId", "stateName");

        return res.status(200).json({
            success: true,
            message: "District updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Active - Inactive
const inactiveDistrict = async (req, res) => {
    try {
        const result = await DistrictModel.findByIdAndUpdate(
            req.params.id,
            { status: "Inactive" },
            { returnDocument: "after" }
        ).populate("stateId", "stateName");

        return res.status(200).json({
            success: true,
            message: "District moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Restore
const restoreDistrict = async (req, res) => {
    try {
        const result = await DistrictModel.findByIdAndUpdate(
            req.params.id,
            { status: "Active" },
            { returnDocument: "after" }
        ).populate("stateId", "stateName");

        return res.status(200).json({
            success: true,
            message: "District restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete
const deleteDistrict = async (req, res) => {
    try {
        await DistrictModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "District deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createDistrict,
    getAllDistricts,
    getInactiveDistricts,
    getDistrictById,
    updateDistrict,
    inactiveDistrict,
    restoreDistrict,
    deleteDistrict,
};