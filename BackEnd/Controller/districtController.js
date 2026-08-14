const DistrictModel = require("../Model/districtModel");
const StateModel = require("../Model/stateModel");
const XLSX = require('xlsx')

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

const bulkPreviewDistricts = async (req, res) => {
    try {
        console.log("========== DISTRICT BULK PREVIEW ==========");

        const file = req.files?.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file",
            });
        }

        // Read Excel
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

        // Get state names from Excel
        const stateNames = [
            ...new Set(
                rows
                    .map((row) =>
                        String(row.stateName || "")
                            .trim()
                            .toLowerCase()
                    )
                    .filter(Boolean)
            ),
        ];

        // Find states
        const states = await StateModel.find({
            stateName: {
                $in: stateNames,
            },
        }).select("_id stateName");

        // stateName -> state document
        const stateMap = new Map();

        states.forEach((state) => {
            stateMap.set(
                state.stateName.trim().toLowerCase(),
                state
            );
        });

        // Prepare combinations for existing district check
        const districtConditions = [];

        rows.forEach((row) => {
            const districtName = String(row.districtName || "")
                .trim()
                .toLowerCase();

            const stateName = String(row.stateName || "")
                .trim()
                .toLowerCase();

            const state = stateMap.get(stateName);

            if (districtName && state) {
                districtConditions.push({
                    districtName,
                    stateId: state._id,
                });
            }
        });

        // Find existing districts
        let existingDistricts = [];

        if (districtConditions.length > 0) {
            existingDistricts = await DistrictModel.find({
                $or: districtConditions,
            }).select("districtName stateId");
        }

        // Existing combination set
        const existingDistrictSet = new Set();

        existingDistricts.forEach((district) => {
            existingDistrictSet.add(
                `${district.districtName.trim().toLowerCase()}_${district.stateId.toString()}`
            );
        });

        // Excel duplicate set
        const seenDistricts = new Set();

        const previewRows = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Excel row number
            const rowNumber = i + 2;

            const districtName = String(row.districtName || "")
                .trim()
                .toLowerCase();

            const stateName = String(row.stateName || "")
                .trim()
                .toLowerCase();

            const errors = [];

            // District required
            if (!districtName) {
                errors.push("District name is required");
            }

            // State required
            if (!stateName) {
                errors.push("State name is required");
            }

            // Find State
            const state = stateMap.get(stateName);

            if (stateName && !state) {
                errors.push("State not found");
            }

            // Excel duplicate
            if (districtName && state) {
                const combinationKey =
                    `${districtName}_${state._id.toString()}`;

                if (seenDistricts.has(combinationKey)) {
                    errors.push(
                        "Duplicate district in Excel for this state"
                    );
                } else {
                    seenDistricts.add(combinationKey);
                }

                // DB duplicate
                if (existingDistrictSet.has(combinationKey)) {
                    errors.push(
                        "District already exists in this state"
                    );
                }
            }

            previewRows.push({
                rowNumber,
                districtName,
                stateName,
                stateId: state?._id || null,
                valid: errors.length === 0,
                errors,
            });
        }

        const validCount = previewRows.filter(
            (row) => row.valid
        ).length;

        const invalidCount = previewRows.filter(
            (row) => !row.valid
        ).length;

        return res.status(200).json({
            success: true,
            message: "District preview generated",
            summary: {
                totalRows: previewRows.length,
                valid: validCount,
                invalid: invalidCount,
            },
            rows: previewRows,
        });

    } catch (error) {
        console.error(
            "Bulk District Preview Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const bulkImportDistricts = async (req, res) => {
    try {
        console.log("========== DISTRICT BULK IMPORT ==========");

        let districts = [];

        // =========================================
        // OPTION 1: Preview se JSON data
        // =========================================
        if (req.body?.districts) {
            try {
                districts =
                    typeof req.body.districts === "string"
                        ? JSON.parse(req.body.districts)
                        : req.body.districts;

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid district data",
                });
            }

            if (!Array.isArray(districts)) {
                return res.status(400).json({
                    success: false,
                    message: "Districts must be an array",
                });
            }
        }

        // =========================================
        // OPTION 2: Direct Excel upload
        // =========================================
        else if (req.files?.file) {

            const file = req.files.file;

            const workbook = XLSX.read(file.data, {
                type: "buffer",
            });

            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Excel file does not contain any sheet",
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

            districts = rows.map((row) => ({
                districtName: String(
                    row.districtName || ""
                )
                    .trim()
                    .toLowerCase(),

                stateName: String(
                    row.stateName || ""
                )
                    .trim()
                    .toLowerCase(),
            }));
        }

        // =========================================
        // No data
        // =========================================
        else {
            return res.status(400).json({
                success: false,
                message:
                    "No district data or Excel file provided",
            });
        }

        // =========================================
        // Normalize
        // =========================================
        districts = districts.map((district) => ({
            districtName: String(
                district.districtName || ""
            )
                .trim()
                .toLowerCase(),

            stateName: String(
                district.stateName || ""
            )
                .trim()
                .toLowerCase(),
        }));

        // =========================================
        // Get States
        // =========================================
        const stateNames = [
            ...new Set(
                districts
                    .map((district) => district.stateName)
                    .filter(Boolean)
            ),
        ];

        const states = await StateModel.find({
            stateName: {
                $in: stateNames,
            },
        }).select("_id stateName");

        const stateMap = new Map();

        states.forEach((state) => {
            stateMap.set(
                state.stateName.trim().toLowerCase(),
                state
            );
        });

        // =========================================
        // Backend Validation
        // =========================================
        const errors = [];
        const validDistricts = [];

        for (let i = 0; i < districts.length; i++) {

            const district = districts[i];

            if (!district.districtName) {
                errors.push({
                    rowNumber: i + 2,
                    districtName: "",
                    stateName: district.stateName,
                    message: "District name is required",
                });

                continue;
            }

            if (!district.stateName) {
                errors.push({
                    rowNumber: i + 2,
                    districtName: district.districtName,
                    stateName: "",
                    message: "State name is required",
                });

                continue;
            }

            const state = stateMap.get(
                district.stateName
            );

            if (!state) {
                errors.push({
                    rowNumber: i + 2,
                    districtName: district.districtName,
                    stateName: district.stateName,
                    message: "State not found",
                });

                continue;
            }

            validDistricts.push({
                districtName: district.districtName,
                stateName: district.stateName,
                stateId: state._id,
                status: "Active",
            });
        }

        // =========================================
        // Check Existing Districts
        // =========================================
        const districtConditions = validDistricts.map(
            (district) => ({
                districtName: district.districtName,
                stateId: district.stateId,
            })
        );

        let existingDistricts = [];

        if (districtConditions.length > 0) {
            existingDistricts =
                await DistrictModel.find({
                    $or: districtConditions,
                }).select(
                    "districtName stateId"
                );
        }

        const existingDistrictSet = new Set();

        existingDistricts.forEach((district) => {
            existingDistrictSet.add(
                `${district.districtName.trim().toLowerCase()}_${district.stateId.toString()}`
            );
        });

        const finalDistricts = [];

        validDistricts.forEach((district, index) => {

            const combinationKey =
                `${district.districtName}_${district.stateId.toString()}`;

            if (existingDistrictSet.has(combinationKey)) {

                errors.push({
                    rowNumber: index + 2,
                    districtName: district.districtName,
                    stateName: district.stateName,
                    message:
                        "District already exists in this state",
                });

            } else {

                finalDistricts.push({
                    districtName: district.districtName,
                    stateId: district.stateId,
                    status: "Active",
                });
            }
        });

        // =========================================
        // Check Internal Excel Duplicates
        // =========================================
        const seenDistricts = new Set();
        const uniqueDistricts = [];

        finalDistricts.forEach((district, index) => {

            const combinationKey =
                `${district.districtName}_${district.stateId.toString()}`;

            if (seenDistricts.has(combinationKey)) {

                errors.push({
                    rowNumber: index + 2,
                    districtName: district.districtName,
                    message:
                        "Duplicate district in Excel for this state",
                });

            } else {

                seenDistricts.add(combinationKey);

                uniqueDistricts.push(district);
            }
        });

        // =========================================
        // Insert
        // =========================================
        let insertedDistricts = [];

        if (uniqueDistricts.length > 0) {

            insertedDistricts =
                await DistrictModel.insertMany(
                    uniqueDistricts,
                    {
                        ordered: false,
                    }
                );
        }

        // =========================================
        // Response
        // =========================================
        return res.status(200).json({
            success: true,
            message:
                "Bulk district import completed",

            summary: {
                totalRows: districts.length,
                imported: insertedDistricts.length,
                failed: errors.length,
            },

            errors,
        });

    } catch (error) {

        console.error(
            "Bulk District Import Error:",
            error
        );

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
    bulkPreviewDistricts,
    bulkImportDistricts
};