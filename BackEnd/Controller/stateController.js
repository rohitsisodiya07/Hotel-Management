const StateModel = require("../Model/stateModel");
const XLSX = require('xlsx')

// create state
const createState = async (req, res) => {
    try {
        const { stateName } = req.body;
        console.log(">>>>>stateName", stateName);

        if (!stateName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "State name is required",
            });
        }

        const formattedState = stateName.trim().toLowerCase();
        console.log(">>>>>>formatedState", formattedState);

        const existingState = await StateModel.findOne({ stateName: formattedState });

        if (existingState) {
            return res.status(400).json({
                success: false,
                message: "State already exists",
            });
        }

        const result = await StateModel.create({
            stateName: formattedState,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "State created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all active states with pagination & sorting
const getAllStates = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc" } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Active",
            stateName: {
                $regex: search,
                $options: "i", // i means case-insensitive.
            },
        };

        const result = await StateModel.find(query)
            .sort({ stateName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await StateModel.countDocuments(query);

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

// get all inactive states with pagination & sorting
const getInactiveStates = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, sort = "asc" } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            status: "Inactive",
            stateName: {
                $regex: search,
                $options: "i",
            },
        };

        const result = await StateModel.find(query)
            .sort({ stateName: sort === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await StateModel.countDocuments(query);

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

// get one State
const getStateById = async (req, res) => {
    try {
        console.log(">>>>>>req.params", req.params.id);

        const result = await StateModel.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "State not found",
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

// permanent Delete
const deleteState = async (req, res) => {
    try {
        console.log(">>>>>>req.params.id", req.params.id);

        await StateModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "State deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// update state
const updateState = async (req, res) => {
    try {
        const { stateName } = req.body;

        if (!stateName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "State name is required",
            });
        }

        const formattedState = stateName.trim().toLowerCase();

        const existingState = await StateModel.findOne({
            stateName: formattedState,
            _id: { $ne: req.params.id },
        });

        if (existingState) {
            return res.status(400).json({
                success: false,
                message: "State already exists",
            });
        }

        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                stateName: formattedState,
            },
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            success: true,
            message: "State updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Active-Inactive
const inactiveState = async (req, res) => {
    try {
        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Inactive",
            },
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            success: true,
            message: "State moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Restore State
const restoreState = async (req, res) => {
    try {
        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Active",
            },
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            success: true,
            message: "State restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Bulk Import
// ================= BULK IMPORT STATES =================
const bulkImportStates = async (req, res) => {
    try {
        console.log("========== STATE BULK IMPORT ==========");

        let states = [];

        // OPTION 1: Preview se JSON data
        if (req.body?.states) {
            try {
                states = typeof req.body.states === "string"
                    ? JSON.parse(req.body.states)
                    : req.body.states;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid state data",
                });
            }

            if (!Array.isArray(states)) {
                return res.status(400).json({
                    success: false,
                    message: "States must be an array",
                });
            }
        }
        // OPTION 2: Direct Excel upload
        else if (req.files?.file) {
            const file = req.files.file;
            const workbook = XLSX.read(file.data, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                return res.status(400).json({
                    success: false,
                    message: "Excel file does not contain any sheet",
                });
            }

            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                defval: "",
                raw: true,
            });

            if (!rows.length) {
                return res.status(400).json({
                    success: false,
                    message: "Excel file is empty",
                });
            }

            states = rows.map((row) => ({
                stateName: String(row.stateName || "").trim().toLowerCase(),
            }));
        } else {
            return res.status(400).json({
                success: false,
                message: "No state data or Excel file provided",
            });
        }

        // Normalize Data
        states = states.map((state) => ({
            stateName: String(state.stateName || "").trim().toLowerCase(),
        }));

        // Backend Validation
        const errors = [];
        const validStates = [];

        for (let i = 0; i < states.length; i++) {
            const state = states[i];

            if (!state.stateName) {
                errors.push({
                    rowNumber: i + 2,
                    stateName: "",
                    message: "State name is required",
                });
                continue;
            }

            validStates.push({
                stateName: state.stateName,
                status: "Active",
                createdBy: req.user._id,
            });
        }

        const stateNames = validStates.map((state) => state.stateName);

        // 🚀 FIX: Case-insensitive DB Query for Import as well
        const existingStates = await StateModel.find({
            stateName: {
                $in: stateNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
        }).select("stateName");

        // 🚀 FIX: Normalize
        const existingStateNames = new Set(
            existingStates.map((state) => state.stateName.trim().toLowerCase())
        );

        const finalStates = [];

        validStates.forEach((state, index) => {
            if (existingStateNames.has(state.stateName)) {
                errors.push({
                    rowNumber: index + 2,
                    stateName: state.stateName,
                    message: "State already exists",
                });
            } else {
                finalStates.push(state);
            }
        });

        // Check Internal Duplicates
        const seenStates = new Set();
        const uniqueStates = [];

        finalStates.forEach((state, index) => {
            if (seenStates.has(state.stateName)) {
                errors.push({
                    rowNumber: index + 2,
                    stateName: state.stateName,
                    message: "Duplicate state in Excel",
                });
            } else {
                seenStates.add(state.stateName);
                uniqueStates.push(state);
            }
        });

        // Insert States
        let insertedStates = [];
        if (uniqueStates.length > 0) {
            insertedStates = await StateModel.insertMany(uniqueStates, {
                ordered: false,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bulk state import completed",
            summary: {
                totalRows: states.length,
                imported: insertedStates.length,
                failed: errors.length,
            },
            errors,
        });

    } catch (error) {
        console.error("Bulk State Import Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ================= BULK PREVIEW STATES =================
const bulkPreviewStates = async (req, res) => {
    try {
        console.log("========== STATE BULK PREVIEW ==========");

        const file = req.files?.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file",
            });
        }

        // Read Excel file
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

        // Convert Excel to JSON
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

        // Get all state names from Excel
        const stateNames = rows
            .map((row) =>
                String(row.stateName || "")
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        // 🚀 FIX: Case-insensitive DB Query
        const existingStates = await StateModel.find({
            stateName: {
                $in: stateNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
        }).select("stateName");

        // 🚀 FIX: Normalize DB results for the Set
        const existingStateNames = new Set(
            existingStates.map((state) => state.stateName.trim().toLowerCase())
        );

        // Check duplicate inside Excel
        const seenStates = new Set();
        const previewRows = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // Excel row starts from 2

            // Frontend display ke liye original name rakhte hain
            const originalStateName = String(row.stateName || "").trim();
            const stateName = originalStateName.toLowerCase();

            const errors = [];

            // Required validation
            if (!stateName) {
                errors.push("State name is required");
            } else {
                // Excel duplicate
                if (seenStates.has(stateName)) {
                    errors.push("Duplicate state in Excel");
                } else {
                    seenStates.add(stateName);
                }

                // Database duplicate
                if (existingStateNames.has(stateName)) {
                    errors.push("State already exists");
                }
            }

            previewRows.push({
                rowNumber,
                stateName: originalStateName,
                valid: errors.length === 0,
                errors,
            });
        }

        const validCount = previewRows.filter((row) => row.valid).length;
        const invalidCount = previewRows.filter((row) => !row.valid).length;

        return res.status(200).json({
            success: true,
            message: "State preview generated",
            summary: {
                totalRows: previewRows.length,
                valid: validCount,
                invalid: invalidCount,
            },
            rows: previewRows,
        });

    } catch (error) {
        console.error("Bulk State Preview Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createState,
    getAllStates,
    getInactiveStates,
    getStateById,
    deleteState,
    updateState,
    inactiveState,
    restoreState,
    bulkImportStates,
    bulkPreviewStates
};