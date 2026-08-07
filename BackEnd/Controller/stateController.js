const StateModel = require("../Model/stateModel");

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

        const result = await StateModel.create({ stateName: formattedState });

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

module.exports = {
    createState,
    getAllStates,
    getInactiveStates,
    getStateById,
    deleteState,
    updateState,
    inactiveState,
    restoreState,
};