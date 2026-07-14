const DistrictModel = require("../Model/districtModel");
const StateModel = require("../Model/stateModel");

//Create
const createDistrict = async (req, res) => {
    try {
        const { districtName, stateId } = req.body;

        if (!districtName?.trim() || !stateId) {
            return res.status(400).json({
                success: false,
                message:
                    "District name and State are required",
            });
        }

        const state = await StateModel.findById(
            stateId
        );

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        const formattedDistrict =
            districtName.trim().toLowerCase();

        const existingDistrict =
            await DistrictModel.findOne({
                districtName: formattedDistrict,
                stateId,
            });

        if (existingDistrict) {
            return res.status(400).json({
                success: false,
                message:
                    "District already exists in this state",
            });
        }

        const result =
            await DistrictModel.create({
                districtName:
                    formattedDistrict,
                stateId,
            });

        return res.status(201).json({
            success: true,
            message:
                "District created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Get Active
const getAllDistricts = async (
    req,
    res
) => {
    try {
        const result =
            await DistrictModel.find({
                status: "Active",
            }).populate(
                "stateId",
                "stateName"
            );

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

//Get Inactive
const getInactiveDistricts = async (req, res) => {
    try {
        const result =
            await DistrictModel.find({
                status: "Inactive",
            }).populate(
                "stateId",
                "stateName"
            );

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

//Get One
const getDistrictById = async (
    req,
    res
) => {
    try {
        const result =
            await DistrictModel.findById(
                req.params.id
            ).populate(
                "stateId",
                "stateName"
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "District not found",
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

//Update
const updateDistrict = async (
    req,
    res
) => {
    try {
        const {
            districtName,
            stateId,
        } = req.body;

        if (
            !districtName?.trim() ||
            !stateId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "District name and State are required",
            });
        }

        const state =
            await StateModel.findById(
                stateId
            );

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found",
            });
        }

        const formattedDistrict =
            districtName.trim().toLowerCase();

        const existingDistrict =
            await DistrictModel.findOne({
                districtName:
                    formattedDistrict,
                stateId,
                _id: {
                    $ne: req.params.id,
                },
            });

        if (existingDistrict) {
            return res.status(400).json({
                success: false,
                message:
                    "District already exists in this state",
            });
        }

        const result =
            await DistrictModel.findByIdAndUpdate(
                req.params.id,
                {
                    districtName:
                        formattedDistrict,
                    stateId,
                },
                {
                    new: true,
                }
            ).populate(
                "stateId",
                "stateName"
            );

        return res.status(200).json({
            success: true,
            message:
                "District updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Active - Inactive
const inactiveDistrict = async (req, res) => {
    try {
        const result =
            await DistrictModel.findByIdAndUpdate(
                req.params.id,
                {
                    status:
                        "Inactive",
                },
                {
                    new: true,
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "District moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

//Restore
const restoreDistrict = async (req, res) => {
    try {
        const result =
            await DistrictModel.findByIdAndUpdate(
                req.params.id,
                {
                    status: "Active",
                },
                {
                    new: true,
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "District restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// Delete
const deleteDistrict = async (
    req,
    res
) => {
    try {
        await DistrictModel.findByIdAndDelete(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message:
                "District deleted successfully",
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