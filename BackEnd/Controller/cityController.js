const CityModel = require("../Model/cityModel");
const DistrictModel = require("../Model/districtModel");

// ================= CREATE CITY =================
const createCity = async (req, res) => {
    try {
        const { cityName, districtId } = req.body;

        if (!cityName?.trim() || !districtId) {
            return res.status(400).json({
                success: false,
                message:
                    "City name and District are required",
            });
        }

        const district =
            await DistrictModel.findById(
                districtId
            );

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found",
            });
        }

        const formattedCity =
            cityName.trim().toLowerCase();

        const existingCity =
            await CityModel.findOne({
                cityName: formattedCity,
                districtId,
            });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message:
                    "City already exists in this district",
            });
        }

        const result =
            await CityModel.create({
                cityName: formattedCity,
                districtId,
            });

        return res.status(201).json({
            success: true,
            message:
                "City created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ================= GET ALL ACTIVE CITIES =================
const getAllCities = async (
    req,
    res
) => {
    try {
        const result =
            await CityModel.find({
                status: "Active",
            }).populate(
                "districtId",
                "districtName"
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

// ================= GET ALL INACTIVE CITIES =================
const getInactiveCities =
    async (req, res) => {
        try {
            const result =
                await CityModel.find({
                    status: "Inactive",
                }).populate(
                    "districtId",
                    "districtName"
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

// ================= GET ONE CITY =================
const getCityById = async (
    req,
    res
) => {
    try {
        const result =
            await CityModel.findById(
                req.params.id
            ).populate(
                "districtId",
                "districtName"
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "City not found",
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

// ================= UPDATE CITY =================
const updateCity = async (
    req,
    res
) => {
    try {
        const {
            cityName,
            districtId,
        } = req.body;

        if (
            !cityName?.trim() ||
            !districtId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "City name and District are required",
            });
        }

        const district =
            await DistrictModel.findById(
                districtId
            );

        if (!district) {
            return res.status(404).json({
                success: false,
                message:
                    "District not found",
            });
        }

        const formattedCity =
            cityName.trim().toLowerCase();

        const existingCity =
            await CityModel.findOne({
                cityName:
                    formattedCity,
                districtId,
                _id: {
                    $ne: req.params.id,
                },
            });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message:
                    "City already exists in this district",
            });
        }

        const result =
            await CityModel.findByIdAndUpdate(
                req.params.id,
                {
                    cityName:
                        formattedCity,
                    districtId,
                },
                {
                    new: true,
                }
            ).populate(
                "districtId",
                "districtName"
            );

        return res.status(200).json({
            success: true,
            message:
                "City updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ================= INACTIVE CITY =================
const inactiveCity = async (
    req,
    res
) => {
    try {
        const result =
            await CityModel.findByIdAndUpdate(
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
                "City moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ================= RESTORE CITY =================
const restoreCity = async (
    req,
    res
) => {
    try {
        const result =
            await CityModel.findByIdAndUpdate(
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
                "City restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ================= DELETE CITY =================
const deleteCity = async (
    req,
    res
) => {
    try {
        await CityModel.findByIdAndDelete(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message:
                "City deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createCity,
    getAllCities,
    getInactiveCities,
    getCityById,
    updateCity,
    inactiveCity,
    restoreCity,
    deleteCity,
};