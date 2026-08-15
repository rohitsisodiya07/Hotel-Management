const roomModel = require("../Model/roomsModel");
const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const XLSX = require('xlsx')

// =========================================================================
// CREATE ROOM (With Complete Enterprise-Grade Validations)
// =========================================================================
const createRoom = async (req, res) => {
    try {
        let { roomNumber, roomType, pricePerNight, maxOccupancy, totalBeds, bedType, roomSize, description, roomAmenities, isFeatured } = req.body;

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        if (!hotel || hotel.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Hotel not found or not approved." });
        }

        if (!roomNumber || !roomType || !pricePerNight || !maxOccupancy || !totalBeds || !bedType) {
            return res.status(400).json({ success: false, message: "All required fields are mandatory." });
        }

        // 1. Room Number Validation
        roomNumber = roomNumber.toString().trim();
        if (roomNumber.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Room number is too long."
            });
        }

        const existingRoom = await roomModel.findOne({ hotelId: hotel._id, roomNumber });
        if (existingRoom) return res.status(409).json({ success: false, message: "Room number already exists." });

        // 2. Price Validation
        pricePerNight = Number(pricePerNight);
        if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price per night must be greater than zero."
            });
        }

        // 3. Occupancy Validation
        maxOccupancy = Number(maxOccupancy);
        if (!Number.isInteger(maxOccupancy) || maxOccupancy <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid maximum occupancy."
            });
        }

        // 4. Total Beds Validation
        totalBeds = Number(totalBeds);
        if (!Number.isInteger(totalBeds) || totalBeds <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid total beds."
            });
        }

        // 5. Room Type Validation
        const allowedRoomTypes = [
            "Standard",
            "Deluxe",
            "Super Deluxe",
            "Suite",
            "Family Room",
        ];
        if (!allowedRoomTypes.includes(roomType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room type."
            });
        }

        // 6. Bed Type Validation
        const allowedBedTypes = [
            "Single",
            "Double",
            "Queen",
            "King",
        ];
        if (!allowedBedTypes.includes(bedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed type."
            });
        }

        // 7. Description Validation
        if (description && description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Description should contain at least 20 characters."
            });
        }

        // 10. Room Size Validation
        roomSize = Number(roomSize || 0);
        if (roomSize < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid room size."
            });
        }

        // 8. Images Validations ⭐⭐⭐
        if (!req.files || !req.files.roomImages) {
            return res.status(400).json({ success: false, message: "Images required." });
        }

        const images = Array.isArray(req.files.roomImages)
            ? req.files.roomImages
            : [req.files.roomImages];

        if (images.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Upload at least 5 room images."
            });
        }
        if (images.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Maximum 10 room images are allowed."
            });
        }

        const uploadedImages = await uploadImage(images, "hotel-management/rooms");

        // 11. Upload Success Check
        if (!uploadedImages || !uploadedImages.length) {
            return res.status(500).json({
                success: false,
                message: "Room image upload failed."
            });
        }

        const roomImages = uploadedImages.map((image) => image.secure_url);

        // 9. Amenities Parsing & Validation
        let amenitiesArray = [];
        if (typeof roomAmenities === "string") {
            amenitiesArray = roomAmenities.split(",").map((item) => item.trim()).filter(Boolean);
        } else if (Array.isArray(roomAmenities)) {
            amenitiesArray = roomAmenities.map(item => item.trim()).filter(Boolean);
        }

        if (!Array.isArray(amenitiesArray) || amenitiesArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Select at least one room amenity."
            });
        }

        const room = await roomModel.create({
            hotelId: hotel._id,
            roomNumber,
            roomType,
            pricePerNight,
            maxOccupancy,
            totalBeds,
            bedType,
            roomSize,
            description: description ? description.trim() : "",
            roomAmenities: amenitiesArray,
            roomImages,
            isFeatured: isFeatured === true || isFeatured === "true",
        });

        return res.status(201).json({ success: true, message: "Room created successfully.", room });
    } catch (error) {
        console.error("Create Room Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET MY ROOMS
// =========================================================================
const getMyRooms = async (req, res) => {
    try {
        let hotelId;

        if (req.user.role === "hotel") {
            const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
            if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });
            hotelId = hotel._id;
        } else if (req.user.role === "admin") {
            const hotel = await hotelModel.findOne({ adminId: req.user._id });
            if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });
            hotelId = hotel._id;
        }

        const { search = "", status = "All", sort = "newest", page = 1, limit = 6 } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 6;
        const skip = (pageNum - 1) * limitNum;

        let query = { hotelId };

        if (status === "Active") {
            query.isActive = true;
        } else if (status === "Inactive") {
            query.isActive = false;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { roomType: searchRegex },
                { description: searchRegex }
            ];
            const parsedNum = Number(search.trim());
            if (!isNaN(parsedNum)) {
                query.$or.push({ roomNumber: parsedNum });
            }
        }

        let sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };
        else if (sort === "price-high") sortOption = { pricePerNight: -1 };
        else if (sort === "price-low") sortOption = { pricePerNight: 1 };

        const rooms = await roomModel.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await roomModel.countDocuments(query);
        const activeCount = await roomModel.countDocuments({ hotelId, isActive: true });
        const inactiveCount = await roomModel.countDocuments({ hotelId, isActive: false });

        return res.status(200).json({
            success: true,
            totalRooms: total,
            stats: {
                total: activeCount + inactiveCount,
                active: activeCount,
                inactive: inactiveCount
            },
            rooms,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });

    } catch (error) {
        console.error("Get My Rooms Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// VIEW SINGLE ROOM (GET BY ID)
// =========================================================================
const viewRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await roomModel.findById(roomId);

        if (!room) return res.status(404).json({ success: false, message: "Room not found." });

        return res.status(200).json({ success: true, room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// UPDATE ROOM
// =========================================================================
const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        let updateData = req.body;

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        if (req.files && req.files.roomImages) {
            const images = Array.isArray(req.files.roomImages)
                ? req.files.roomImages
                : [req.files.roomImages];

            if (images.length > 10) {
                return res.status(400).json({ success: false, message: "Maximum 10 room images are allowed." });
            }

            const uploadedImages = await uploadImage(images, "hotel-management/rooms");
            if (!uploadedImages || !uploadedImages.length) {
                return res.status(500).json({ success: false, message: "Room image upload failed." });
            }
            updateData.roomImages = uploadedImages.map(img => img.secure_url);
        }

        if (typeof updateData.roomAmenities === "string") {
            updateData.roomAmenities = updateData.roomAmenities.split(",").map(i => i.trim()).filter(Boolean);
        }

        const updatedRoom = await roomModel.findByIdAndUpdate(roomId, updateData, { new: true });
        return res.status(200).json({ success: true, message: "Room updated.", room: updatedRoom });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// DELETE ROOM
// =========================================================================
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        await roomModel.findByIdAndDelete(roomId);
        return res.status(200).json({ success: true, message: "Room deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// TOGGLE STATUS
// =========================================================================
const toggleRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        room.isActive = !room.isActive;
        await room.save();
        return res.status(200).json({ success: true, message: `Room is now ${room.isActive ? 'Active' : 'Inactive'}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET PUBLIC ROOMS BY HOTEL
// =========================================================================
const getPublicRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { search = "", sort = "lowToHigh" } = req.query;

        let query = { hotelId, isActive: true };

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { roomType: searchRegex },
                { description: searchRegex }
            ];
        }

        let sortOption = { pricePerNight: 1 };
        if (sort === "highToLow") sortOption = { pricePerNight: -1 };
        else if (sort === "newest") sortOption = { createdAt: -1 };

        const rooms = await roomModel.find(query).sort(sortOption);

        return res.status(200).json({
            success: true,
            totalRooms: rooms.length,
            rooms
        });
    } catch (error) {
        console.log("Get Public Rooms Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const bulkPreviewRooms = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file is required",
            });
        }

        const hotel = await hotelModel.findOne({
            hotelEmail: req.user.email,
            status: "Approved",
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved hotel not found.",
            });
        }

        const file = req.files.file;

        const workbook = XLSX.read(file.data, {
            type: "buffer",
        });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(
            worksheet,
            { defval: "" }
        );

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "Excel file is empty.",
            });
        }

        const preview = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const errors = [];

            const roomNumber =
                String(row.roomNumber || "").trim();

            if (!roomNumber) {
                errors.push("Room number is required.");
            }

            const allowedRoomTypes = [
                "Standard",
                "Deluxe",
                "Super Deluxe",
                "Suite",
                "Family Room",
            ];

            if (!allowedRoomTypes.includes(row.roomType)) {
                errors.push("Invalid room type.");
            }

            const price = Number(row.pricePerNight);

            if (!Number.isFinite(price) || price <= 0) {
                errors.push(
                    "Price per night must be greater than zero."
                );
            }

            const maxOccupancy =
                Number(row.maxOccupancy);

            if (
                !Number.isInteger(maxOccupancy) ||
                maxOccupancy <= 0
            ) {
                errors.push("Invalid maximum occupancy.");
            }

            const totalBeds =
                Number(row.totalBeds);

            if (
                !Number.isInteger(totalBeds) ||
                totalBeds <= 0
            ) {
                errors.push("Invalid total beds.");
            }

            const allowedBedTypes = [
                "Single",
                "Double",
                "Queen",
                "King",
            ];

            if (!allowedBedTypes.includes(row.bedType)) {
                errors.push("Invalid bed type.");
            }

            // Minimum 5 images
            const images = [
                row.image1,
                row.image2,
                row.image3,
                row.image4,
                row.image5,
            ].filter(
                (image) =>
                    String(image || "").trim()
            );

            if (images.length < 5) {
                errors.push(
                    "Minimum 5 room images are required."
                );
            }

            // Duplicate check
            if (roomNumber) {
                const existingRoom =
                    await roomModel.findOne({
                        hotelId: hotel._id,
                        roomNumber,
                    });

                if (existingRoom) {
                    errors.push(
                        "Room number already exists."
                    );
                }
            }

            preview.push({
                rowNumber: i + 2,
                roomNumber,
                roomType: row.roomType,
                pricePerNight: price,
                status:
                    errors.length === 0
                        ? "Valid"
                        : "Invalid",
                errors,
                originalData: row,
            });
        }

        const validRows =
            preview.filter(
                (row) => row.status === "Valid"
            ).length;

        const invalidRows =
            preview.filter(
                (row) => row.status === "Invalid"
            ).length;

        return res.status(200).json({
            success: true,
            totalRows: rows.length,
            validRows,
            invalidRows,
            preview,
        });

    } catch (error) {
        console.error(
            "Bulk Room Preview Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const bulkImportRooms = async (req, res) => {
    try {
        // 1. Logged-in hotel find
        const hotel = await hotelModel.findOne({
            hotelEmail: req.user.email,
            status: "Approved",
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved hotel not found.",
            });
        }

        let rows = [];

        // 🚀 SUPPORT JSON FROM FRONTEND PREVIEW
        if (req.body?.rooms) {
            try {
                rows = typeof req.body.rooms === "string" ? JSON.parse(req.body.rooms) : req.body.rooms;
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid room data format" });
            }
            if (!Array.isArray(rows)) {
                return res.status(400).json({ success: false, message: "Rooms must be an array" });
            }
        }
        // FALLBACK DIRECT EXCEL
        else if (req.files && req.files.file) {
            const file = req.files.file;
            const workbook = XLSX.read(file.data, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
            return res.status(400).json({
                success: false,
                message: "Excel file or JSON data is required.",
            });
        }

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "No data to import.",
            });
        }

        const importedRooms = [];
        const errors = [];

        // Process every row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;

            try {
                const roomNumber = String(row.roomNumber || "").trim();
                const roomType = String(row.roomType || "").trim();
                const bedType = String(row.bedType || "").trim();
                const pricePerNight = Number(row.pricePerNight);
                const maxOccupancy = Number(row.maxOccupancy);
                const totalBeds = Number(row.totalBeds);
                const roomSize = Number(row.roomSize || 0);

                if (!roomNumber || !roomType || !bedType || !row.pricePerNight || !row.maxOccupancy || !row.totalBeds) {
                    errors.push({ rowNumber, message: "Required fields are missing." });
                    continue;
                }

                const allowedRoomTypes = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room"];
                if (!allowedRoomTypes.includes(roomType)) {
                    errors.push({ rowNumber, message: "Invalid room type." });
                    continue;
                }

                const allowedBedTypes = ["Single", "Double", "Queen", "King"];
                if (!allowedBedTypes.includes(bedType)) {
                    errors.push({ rowNumber, message: "Invalid bed type." });
                    continue;
                }

                if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
                    errors.push({ rowNumber, message: "Price per night must be greater than zero." });
                    continue;
                }

                if (!Number.isInteger(maxOccupancy) || maxOccupancy <= 0) {
                    errors.push({ rowNumber, message: "Invalid maximum occupancy." });
                    continue;
                }

                if (!Number.isInteger(totalBeds) || totalBeds <= 0) {
                    errors.push({ rowNumber, message: "Invalid total beds." });
                    continue;
                }

                if (!Number.isFinite(roomSize) || roomSize < 0) {
                    errors.push({ rowNumber, message: "Invalid room size." });
                    continue;
                }

                const roomImages = [row.image1, row.image2, row.image3, row.image4, row.image5]
                    .map((image) => String(image || "").trim())
                    .filter(Boolean);

                if (roomImages.length < 5) {
                    errors.push({ rowNumber, message: "Minimum 5 room images are required." });
                    continue;
                }

                const allImages = [row.image1, row.image2, row.image3, row.image4, row.image5, row.image6, row.image7, row.image8, row.image9, row.image10]
                    .map((image) => String(image || "").trim())
                    .filter(Boolean);

                if (allImages.length > 10) {
                    errors.push({ rowNumber, message: "Maximum 10 room images are allowed." });
                    continue;
                }

                const existingRoom = await roomModel.findOne({ hotelId: hotel._id, roomNumber });
                if (existingRoom) {
                    errors.push({ rowNumber, message: `Room ${roomNumber} already exists.` });
                    continue;
                }

                let roomAmenities = [];
                if (typeof row.roomAmenities === "string") {
                    roomAmenities = row.roomAmenities.split(",").map((item) => item.trim()).filter(Boolean);
                }

                if (!roomAmenities.length) {
                    errors.push({ rowNumber, message: "At least one room amenity is required." });
                    continue;
                }

                const description = String(row.description || "").trim();
                if (description && description.length < 20) {
                    errors.push({ rowNumber, message: "Description should contain at least 20 characters." });
                    continue;
                }

                const room = await roomModel.create({
                    hotelId: hotel._id,
                    roomNumber,
                    roomType,
                    pricePerNight,
                    maxOccupancy,
                    totalBeds,
                    bedType,
                    roomSize,
                    description,
                    roomAmenities,
                    roomImages: allImages,
                    isFeatured: String(row.isFeatured || "").toLowerCase() === "true",
                });

                importedRooms.push(room);

            } catch (rowError) {
                errors.push({ rowNumber, message: rowError.message });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Room bulk import completed.",
            totalRows: rows.length,
            importedRows: importedRooms.length,
            failedRows: errors.length,
            errors,
            rooms: importedRooms,
        });

    } catch (error) {
        console.error("Bulk Room Import Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const bulkExportRooms = async (req, res) => {
    try {
        const hotel = await hotelModel.findOne({
            hotelEmail: req.user.email,
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found.",
            });
        }

        const rooms = await roomModel.find({
            hotelId: hotel._id,
        }).sort({
            roomNumber: 1,
        });

        const excelData = rooms.map((room, index) => ({
            "S.No": index + 1,
            "Room Number": room.roomNumber,
            "Room Type": room.roomType,
            "Price Per Night": room.pricePerNight,
            "Max Occupancy": room.maxOccupancy,
            "Total Beds": room.totalBeds,
            "Bed Type": room.bedType,
            "Room Size": room.roomSize,
            "Description": room.description,
            "Room Amenities":
                room.roomAmenities?.join(", ") || "",

            "Image 1":
                room.roomImages?.[0] || "",

            "Image 2":
                room.roomImages?.[1] || "",

            "Image 3":
                room.roomImages?.[2] || "",

            "Image 4":
                room.roomImages?.[3] || "",

            "Image 5":
                room.roomImages?.[4] || "",

            "Booking Status": room.bookingStatus,
            "Featured": room.isFeatured
                ? "Yes"
                : "No",

            "Active":
                room.isActive
                    ? "Yes"
                    : "No",

            "Created At": room.createdAt,
        }));

        const worksheet =
            XLSX.utils.json_to_sheet(excelData);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Rooms"
        );

        const buffer = XLSX.write(
            workbook,
            {
                type: "buffer",
                bookType: "xlsx",
            }
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=rooms-${Date.now()}.xlsx`
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);

    } catch (error) {
        console.error(
            "Bulk Room Export Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { createRoom, getMyRooms, viewRoom, updateRoom, deleteRoom, toggleRoomStatus, getPublicRoomsByHotel, bulkPreviewRooms, bulkImportRooms, bulkExportRooms };