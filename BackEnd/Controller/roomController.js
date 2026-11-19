const roomModel = require("../Model/roomsModel");
const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const XLSX = require('xlsx');
const { invalidateDashboardCache } = require("../Utilities/redisClient");

// Helper to find the active hotel for the current logged in user
const findActiveHotelForUser = async (user) => {
    if (!user) return null;
    const emailLower = (user.email || "").toLowerCase();

    if (user.role === "hotel") {
        const hotel = await hotelModel.findOne({
            $or: [
                { hotelEmail: emailLower },
                { hotelEmail: user.email },
                { email: emailLower },
                { email: user.email }
            ]
        });
        if (hotel) return hotel;
    }

    if (user.role === "admin") {
        const hotel = await hotelModel.findOne({
            $or: [{ adminId: user._id }, { admin: user._id }]
        });
        if (hotel) return hotel;
    }

    if (user.role === "superAdmin") {
        return await hotelModel.findOne({ status: "Approved" });
    }

    return await hotelModel.findOne({
        $or: [
            { hotelEmail: emailLower },
            { hotelEmail: user.email },
            { adminId: user._id },
            { admin: user._id }
        ]
    });
};

// =========================================================================
// CREATE ROOM (With Complete Enterprise-Grade Validations)
// =========================================================================
const createRoom = async (req, res) => {
    try {
        let { roomNumber, roomType, pricePerNight, maxOccupancy, totalBeds, bedType, roomSize, description, roomAmenities, isFeatured } = req.body;

        const hotel = await findActiveHotelForUser(req.user);
        if (!hotel || hotel.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Approved hotel not found for your account." });
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

        invalidateDashboardCache();

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
        invalidateDashboardCache();
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
        invalidateDashboardCache();
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
        invalidateDashboardCache();
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

// Helper to normalize room type
const normalizeRoomType = (typeRaw) => {
    const raw = String(typeRaw || "").trim().toLowerCase();
    if (raw === "family" || raw === "family room" || raw === "family-room") return "Family Room";
    if (raw === "premium") return "Premium";
    if (raw === "deluxe") return "Deluxe";
    if (raw === "super deluxe" || raw === "superdeluxe") return "Super Deluxe";
    if (raw === "suite") return "Suite";
    if (raw === "standard") return "Standard";
    const valid = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room", "Family", "Premium"];
    const found = valid.find(v => v.toLowerCase() === raw);
    return found || String(typeRaw || "").trim();
};

// Helper to normalize bed type
const normalizeBedType = (typeRaw) => {
    const raw = String(typeRaw || "").trim().toLowerCase();
    if (raw === "king") return "King";
    if (raw === "queen") return "Queen";
    if (raw === "double") return "Double";
    if (raw === "single") return "Single";
    const valid = ["Single", "Double", "Queen", "King"];
    const found = valid.find(v => v.toLowerCase() === raw);
    return found || String(typeRaw || "").trim();
};

// Helper to extract amenities from any header / delimiter
const parseAmenities = (row) => {
    const raw = row.roomAmenities || row.amenities || row.Amenities || row.RoomAmenities || "";
    if (Array.isArray(raw)) {
        return raw.map(a => String(a).trim()).filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
        return raw.split(/[;,|]+/).map(a => a.trim()).filter(Boolean);
    }
    return [];
};

// Helper to extract room images
const parseRoomImages = (row) => {
    const images = [];
    for (let k = 1; k <= 10; k++) {
        const val = row[`image${k}`] || row[`Image${k}`];
        if (val && String(val).trim()) {
            images.push(String(val).trim());
        }
    }
    if (images.length === 0 && (row.roomImages || row.images || row.Images)) {
        const raw = row.roomImages || row.images || row.Images;
        if (Array.isArray(raw)) images.push(...raw.map(i => String(i).trim()).filter(Boolean));
        else if (typeof raw === "string") images.push(...raw.split(/[;,|]+/).map(i => i.trim()).filter(Boolean));
    }
    return images;
};

const bulkPreviewRooms = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: "Excel or CSV file is required.",
            });
        }

        const hotel = await findActiveHotelForUser(req.user);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved hotel not found for your account.",
            });
        }

        const file = req.files.file;
        const workbook = XLSX.read(file.data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "File is empty or has no data rows.",
            });
        }

        const preview = [];
        const allowedRoomTypes = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room", "Family", "Premium"];
        const allowedBedTypes = ["Single", "Double", "Queen", "King"];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const errors = [];

            const roomNumber = String(row.roomNumber || row.RoomNumber || row["Room No"] || row.room_no || "").trim();
            if (!roomNumber) {
                errors.push("Room number is required.");
            }

            const rawRoomType = String(row.roomType || row.RoomType || row["Room Type"] || row.type || "").trim();
            const roomType = normalizeRoomType(rawRoomType);
            if (!allowedRoomTypes.includes(roomType)) {
                errors.push(`Invalid room type: '${rawRoomType}'. Allowed: Standard, Deluxe, Super Deluxe, Suite, Family Room, Premium.`);
            }

            const rawBedType = String(row.bedType || row.BedType || row["Bed Type"] || row.bed || "King").trim();
            const bedType = normalizeBedType(rawBedType);
            if (!allowedBedTypes.includes(bedType)) {
                errors.push(`Invalid bed type: '${rawBedType}'. Allowed: Single, Double, Queen, King.`);
            }

            const price = Number(row.pricePerNight || row.price || row.Price || 0);
            if (!Number.isFinite(price) || price <= 0) {
                errors.push("Price per night must be greater than zero.");
            }

            const maxOccupancy = Number(row.maxOccupancy || row.occupancy || row.MaxOccupancy || 2);
            if (!Number.isInteger(maxOccupancy) || maxOccupancy <= 0) {
                errors.push("Invalid maximum occupancy.");
            }

            const totalBeds = Number(row.totalBeds || row.beds || row.TotalBeds || 1);
            if (!Number.isInteger(totalBeds) || totalBeds <= 0) {
                errors.push("Invalid total beds.");
            }

            const images = parseRoomImages(row);
            if (images.length < 5) {
                errors.push(`Minimum 5 room images are required (found ${images.length}).`);
            }

            const amenities = parseAmenities(row);
            if (amenities.length === 0) {
                errors.push("At least one room amenity is required.");
            }

            const description = String(row.description || row.Description || "").trim();

            preview.push({
                rowNumber: i + 2,
                roomNumber,
                roomName: String(row.roomName || row.name || "").trim(),
                roomType,
                pricePerNight: price,
                status: errors.length === 0 ? "Valid" : "Invalid",
                errors,
                originalData: {
                    ...row,
                    roomNumber,
                    roomName: String(row.roomName || row.name || "").trim(),
                    roomType,
                    bedType,
                    pricePerNight: price,
                    maxOccupancy,
                    adultCapacity: Number(row.adultCapacity) || maxOccupancy || 2,
                    childCapacity: Number(row.childCapacity) || 0,
                    totalBeds,
                    description,
                    roomAmenities: amenities.length > 0 ? amenities : ["Air Conditioning", "Wi-Fi", "Ensuite Bathroom"],
                    roomImages: images,
                    isFeatured: String(row.isFeatured || "").toLowerCase() === "true",
                },
            });
        }

        const validRows = preview.filter((row) => row.status === "Valid").length;
        const invalidRows = preview.filter((row) => row.status === "Invalid").length;

        return res.status(200).json({
            success: true,
            totalRows: rows.length,
            validRows,
            invalidRows,
            preview,
        });

    } catch (error) {
        console.error("Bulk Room Preview Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const bulkImportRooms = async (req, res) => {
    try {
        const hotel = await findActiveHotelForUser(req.user);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved hotel not found for your account.",
            });
        }

        let rows = [];

        // 🚀 SUPPORT JSON FROM FRONTEND PREVIEW
        if (req.body?.rooms) {
            try {
                rows = typeof req.body.rooms === "string" ? JSON.parse(req.body.rooms) : req.body.rooms;
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid room data format." });
            }
            if (!Array.isArray(rows)) {
                return res.status(400).json({ success: false, message: "Rooms must be an array." });
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
                message: "Excel/CSV file or JSON room data is required.",
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
        const allowedRoomTypes = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room", "Family", "Premium"];
        const allowedBedTypes = ["Single", "Double", "Queen", "King"];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = row.rowNumber || (i + 2);

            try {
                const roomNumber = String(row.roomNumber || row.RoomNumber || row["Room No"] || row.room_no || "").trim();
                const roomName = String(row.roomName || row.name || row.RoomName || "").trim();
                const rawRoomType = String(row.roomType || row.RoomType || row["Room Type"] || "").trim();
                const roomType = normalizeRoomType(rawRoomType);

                const rawBedType = String(row.bedType || row.BedType || row["Bed Type"] || "King").trim();
                const bedType = normalizeBedType(rawBedType);

                const pricePerNight = Number(row.pricePerNight || row.price || row.Price || 0);
                const maxOccupancy = Number(row.maxOccupancy || row.occupancy || 2);
                const adultCapacity = Number(row.adultCapacity || maxOccupancy || 2);
                const childCapacity = Number(row.childCapacity || 0);
                const totalBeds = Number(row.totalBeds || row.beds || 1);
                const roomSize = Number(row.roomSize || 0);
                const description = String(row.description || "").trim();

                if (!roomNumber) {
                    errors.push({ rowNumber, message: "Room number is required." });
                    continue;
                }

                if (!allowedRoomTypes.includes(roomType)) {
                    errors.push({ rowNumber, message: `Invalid room type '${rawRoomType}'.` });
                    continue;
                }

                if (!allowedBedTypes.includes(bedType)) {
                    errors.push({ rowNumber, message: `Invalid bed type '${rawBedType}'.` });
                    continue;
                }

                if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
                    errors.push({ rowNumber, message: "Price per night must be greater than zero." });
                    continue;
                }

                // Parse Amenities
                let roomAmenities = Array.isArray(row.roomAmenities) && row.roomAmenities.length > 0 
                    ? row.roomAmenities 
                    : parseAmenities(row);

                if (!roomAmenities.length) {
                    roomAmenities = ["Air Conditioning", "Wi-Fi", "Ensuite Bathroom", "Housekeeping"];
                }

                // Parse Images
                let roomImages = Array.isArray(row.roomImages) && row.roomImages.length > 0
                    ? row.roomImages
                    : parseRoomImages(row);

                if (roomImages.length < 5) {
                    errors.push({ rowNumber, message: `Minimum 5 room images required (found ${roomImages.length}).` });
                    continue;
                }

                // Upsert: check if room already exists for this hotel
                const existingRoom = await roomModel.findOne({ hotelId: hotel._id, roomNumber });
                if (existingRoom) {
                    existingRoom.roomName = roomName || existingRoom.roomName;
                    existingRoom.roomType = roomType;
                    existingRoom.pricePerNight = pricePerNight;
                    existingRoom.maxOccupancy = maxOccupancy;
                    existingRoom.adultCapacity = adultCapacity;
                    existingRoom.childCapacity = childCapacity;
                    existingRoom.totalBeds = totalBeds;
                    existingRoom.bedType = bedType;
                    existingRoom.roomSize = roomSize;
                    if (description) existingRoom.description = description;
                    existingRoom.roomAmenities = roomAmenities;
                    existingRoom.roomImages = roomImages;
                    existingRoom.isFeatured = String(row.isFeatured || "").toLowerCase() === "true";
                    await existingRoom.save();
                    importedRooms.push(existingRoom);
                } else {
                    const room = await roomModel.create({
                        hotelId: hotel._id,
                        roomNumber,
                        roomName,
                        roomType,
                        pricePerNight,
                        maxOccupancy,
                        adultCapacity,
                        childCapacity,
                        totalBeds,
                        bedType,
                        roomSize,
                        description,
                        roomAmenities,
                        roomImages,
                        isFeatured: String(row.isFeatured || "").toLowerCase() === "true",
                    });
                    importedRooms.push(room);
                }

            } catch (rowError) {
                console.error(`Row ${rowNumber} import error:`, rowError);
                errors.push({ rowNumber, message: rowError.message });
            }
        }

        invalidateDashboardCache();

        return res.status(201).json({
            success: true,
            message: importedRooms.length > 0
                ? `Successfully imported/updated ${importedRooms.length} room(s).`
                : "No rooms could be imported. Please review row requirements.",
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
        const hotel = await findActiveHotelForUser(req.user);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Approved hotel not found.",
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