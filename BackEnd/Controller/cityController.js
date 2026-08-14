const CityModel = require("../Model/cityModel");
const DistrictModel = require("../Model/districtModel");
const XLSX = require("xlsx");


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

const bulkPreviewCities = async (req, res) => {
    try {
        console.log("========== CITY BULK PREVIEW ==========");

        const file = req.files?.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file",
            });
        }

        const workbook = XLSX.read(file.data, {
            type: "buffer",
        });

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
            return res.status(400).json({
                success: false,
                message: "Excel file does not contain any sheet",
            });
        }

        const rows = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName],
            {
                defval: "",
                raw: true,
            }
        );

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "Excel file is empty",
            });
        }

        // Get district names from Excel
        const districtNames = [
            ...new Set(
                rows
                    .map((row) =>
                        String(row.districtName || "")
                            .trim()
                            .toLowerCase()
                    )
                    .filter(Boolean)
            ),
        ];

        // 🚀 FIX 1: Case-insensitive District query
        const districts = await DistrictModel.find({
            districtName: {
                $in: districtNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
        }).select("_id districtName");

        // districtName -> district document map
        const districtMap = new Map();

        districts.forEach((district) => {
            districtMap.set(
                district.districtName.trim().toLowerCase(),
                district
            );
        });

        // Prepare conditions for existing city check
        const cityConditions = [];

        rows.forEach((row) => {
            const cityName = String(row.cityName || "").trim().toLowerCase();
            const districtName = String(row.districtName || "").trim().toLowerCase();

            const district = districtMap.get(districtName);

            if (cityName && district) {
                cityConditions.push({
                    cityName: new RegExp(`^${cityName}$`, "i"), // 🚀 FIX 2: Case-insensitive City check
                    districtId: district._id,
                });
            }
        });

        // Find existing cities
        let existingCities = [];

        if (cityConditions.length > 0) {
            existingCities = await CityModel.find({
                $or: cityConditions,
            }).select("cityName districtId");
        }

        // Existing combination set for duplicate validation
        const existingCitySet = new Set();

        existingCities.forEach((city) => {
            existingCitySet.add(
                `${city.cityName.trim().toLowerCase()}_${city.districtId.toString()}`
            );
        });

        // Excel internal duplicate tracking
        const seenCities = new Set();
        const previewRows = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;

            // Preserve original case for frontend preview
            const originalCityName = String(row.cityName || "").trim();
            const originalDistrictName = String(row.districtName || "").trim();

            const cityName = originalCityName.toLowerCase();
            const districtName = originalDistrictName.toLowerCase();

            const errors = [];

            if (!cityName) {
                errors.push("City name is required");
            }

            if (!districtName) {
                errors.push("District name is required");
            }

            const district = districtMap.get(districtName);

            if (districtName && !district) {
                errors.push("District not found");
            }

            if (cityName && district) {
                const combinationKey = `${cityName}_${district._id.toString()}`;

                // Excel duplicate
                if (seenCities.has(combinationKey)) {
                    errors.push("Duplicate city in Excel for this district");
                } else {
                    seenCities.add(combinationKey);
                }

                // DB duplicate
                if (existingCitySet.has(combinationKey)) {
                    errors.push("City already exists in this district");
                }
            }

            previewRows.push({
                rowNumber,
                cityName: originalCityName, // Used in frontend UI
                districtName: originalDistrictName,
                districtId: district?._id || null,
                valid: errors.length === 0,
                errors,
            });
        }

        const validCount = previewRows.filter((row) => row.valid).length;
        const invalidCount = previewRows.filter((row) => !row.valid).length;

        return res.status(200).json({
            success: true,
            message: "City preview generated",
            summary: {
                totalRows: previewRows.length,
                valid: validCount,
                invalid: invalidCount,
            },
            rows: previewRows,
        });

    } catch (error) {
        console.error("Bulk City Preview Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ================= BULK IMPORT CITIES =================
const bulkImportCities = async (req, res) => {
    try {
        console.log("========== CITY BULK IMPORT ==========");

        let cities = [];

        // OPTION 1: Preview se JSON data
        if (req.body?.cities) {
            try {
                cities = typeof req.body.cities === "string"
                    ? JSON.parse(req.body.cities)
                    : req.body.cities;
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid city data" });
            }

            if (!Array.isArray(cities)) {
                return res.status(400).json({ success: false, message: "Cities must be an array" });
            }
        }
        // OPTION 2: Direct Excel upload
        else if (req.files?.file) {
            const file = req.files.file;
            const workbook = XLSX.read(file.data, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                return res.status(400).json({ success: false, message: "Excel file does not contain any sheet" });
            }

            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: true });

            cities = rows.map((row) => ({
                cityName: String(row.cityName || "").trim().toLowerCase(),
                districtName: String(row.districtName || "").trim().toLowerCase(),
            }));
        } else {
            return res.status(400).json({ success: false, message: "No city data or Excel file provided" });
        }

        // Normalize initial data
        cities = cities.map((city) => ({
            cityName: String(city.cityName || "").trim().toLowerCase(),
            districtName: String(city.districtName || "").trim().toLowerCase(),
        }));

        // Get districts
        const districtNames = [...new Set(cities.map((city) => city.districtName).filter(Boolean))];

        // 🚀 FIX: Case-insensitive logic for import too
        const districts = await DistrictModel.find({
            districtName: {
                $in: districtNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
        }).select("_id districtName");

        const districtMap = new Map();
        districts.forEach((district) => {
            districtMap.set(district.districtName.trim().toLowerCase(), district);
        });

        const errors = [];
        const validCities = [];

        // Validate
        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];

            if (!city.cityName) {
                errors.push({ rowNumber: i + 2, cityName: "", districtName: city.districtName, message: "City name is required" });
                continue;
            }

            if (!city.districtName) {
                errors.push({ rowNumber: i + 2, cityName: city.cityName, districtName: "", message: "District name is required" });
                continue;
            }

            const district = districtMap.get(city.districtName);

            if (!district) {
                errors.push({ rowNumber: i + 2, cityName: city.cityName, districtName: city.districtName, message: "District not found" });
                continue;
            }

            validCities.push({
                cityName: city.cityName, // Save lowercased or original depending on preference
                districtName: city.districtName,
                districtId: district._id,
                status: "Active",
            });
        }

        // Existing cities
        const cityConditions = validCities.map((city) => ({
            cityName: new RegExp(`^${city.cityName}$`, "i"), // 🚀 FIX: Case-insensitive query
            districtId: city.districtId,
        }));

        let existingCities = [];
        if (cityConditions.length > 0) {
            existingCities = await CityModel.find({ $or: cityConditions }).select("cityName districtId");
        }

        const existingCitySet = new Set();
        existingCities.forEach((city) => {
            existingCitySet.add(`${city.cityName.trim().toLowerCase()}_${city.districtId.toString()}`);
        });

        const finalCities = [];
        validCities.forEach((city, index) => {
            const combinationKey = `${city.cityName}_${city.districtId.toString()}`;

            if (existingCitySet.has(combinationKey)) {
                errors.push({
                    rowNumber: index + 2,
                    cityName: city.cityName,
                    districtName: city.districtName,
                    message: "City already exists in this district",
                });
            } else {
                finalCities.push({
                    cityName: city.cityName,
                    districtId: city.districtId,
                    status: "Active",
                });
            }
        });

        // Excel duplicates
        const seenCities = new Set();
        const uniqueCities = [];

        finalCities.forEach((city, index) => {
            const combinationKey = `${city.cityName}_${city.districtId.toString()}`;

            if (seenCities.has(combinationKey)) {
                errors.push({
                    rowNumber: index + 2,
                    cityName: city.cityName,
                    message: "Duplicate city in Excel for this district",
                });
            } else {
                seenCities.add(combinationKey);
                uniqueCities.push(city);
            }
        });

        // Insert
        let insertedCities = [];

        if (uniqueCities.length > 0) {
            insertedCities = await CityModel.insertMany(uniqueCities, { ordered: false });
        }

        return res.status(200).json({
            success: true,
            message: "Bulk city import completed",
            summary: {
                totalRows: cities.length,
                imported: insertedCities.length,
                failed: errors.length,
            },
            errors,
        });

    } catch (error) {
        console.error("Bulk City Import Error:", error);
        return res.status(500).json({ success: false, message: error.message });
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
    bulkPreviewCities,
    bulkImportCities
};