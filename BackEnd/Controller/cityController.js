const CityModel = require("../Model/cityModel");
const DistrictModel = require("../Model/districtModel");

// Create City
const createCity = async (req, res) => {
    try {
        const { cityName, districtId } = req.body;

        if (!cityName?.trim() || !districtId) {
            return res.status(400).json({
                success: false,
                message: "City name and District are required",
            });
        }

        const district = await DistrictModel.findById(districtId);

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found",
            });
        }

        const formattedCity = cityName.trim().toLowerCase();

        const existingCity = await CityModel.findOne({
            cityName: formattedCity,
            districtId,
        });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message: "City already exists in this district",
            });
        }

        const result = await CityModel.create({
            cityName: formattedCity,
            districtId,
        });

        return res.status(201).json({
            success: true,
            message: "City created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Active Cities with pagination & sorting
const getAllCities = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc", districtId } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Active",
            cityName: {
                $regex: search,
                $options: "i",
            },
        };

        if (districtId) {
            query.districtId = districtId;
        }

        const result = await CityModel.find(query)
            .populate("districtId", "districtName")
            .sort({ cityName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await CityModel.countDocuments(query);

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

// Get All Inactive Cities with pagination & sorting
const getInactiveCities = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc", districtId } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Inactive",
            cityName: {
                $regex: search,
                $options: "i",
            },
        };

        if (districtId) {
            query.districtId = districtId;
        }

        const result = await CityModel.find(query)
            .populate("districtId", "districtName")
            .sort({ cityName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await CityModel.countDocuments(query);

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

// Get City By ID
const getCityById = async (req, res) => {
    try {
        const result = await CityModel.findById(req.params.id).populate(
            "districtId",
            "districtName"
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "City not found",
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

// Update City
const updateCity = async (req, res) => {
    try {
        const { cityName, districtId } = req.body;

        if (!cityName?.trim() || !districtId) {
            return res.status(400).json({
                success: false,
                message: "City name and District are required",
            });
        }

        const district = await DistrictModel.findById(districtId);

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found",
            });
        }

        const formattedCity = cityName.trim().toLowerCase();

        const existingCity = await CityModel.findOne({
            cityName: formattedCity,
            districtId,
            _id: {
                $ne: req.params.id,
            },
        });

        if (existingCity) {
            return res.status(400).json({
                success: false,
                message: "City already exists in this district",
            });
        }

        const result = await CityModel.findByIdAndUpdate(
            req.params.id,
            {
                cityName: formattedCity,
                districtId,
            },
            {
                returnDocument: "after",
            }
        ).populate("districtId", "districtName");

        return res.status(200).json({
            success: true,
            message: "City updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Inactive City (Soft Delete / Move to Inactive)
const inactiveCity = async (req, res) => {
    try {
        const result = await CityModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Inactive",
            },
            {
                returnDocument: "after",
            }
        ).populate("districtId", "districtName");

        return res.status(200).json({
            success: true,
            message: "City moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Restore City
const restoreCity = async (req, res) => {
    try {
        const result = await CityModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Active",
            },
            {
                returnDocument: "after",
            }
        ).populate("districtId", "districtName");

        return res.status(200).json({
            success: true,
            message: "City restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Permanent Delete City
const deleteCity = async (req, res) => {
    try {
        await CityModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "City deleted successfully",
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