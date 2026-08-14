const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const sendEmail = require("../Utilities/NodeMailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const cityModel = require('../Model/cityModel')
const roomModel = require("../Model/roomsModel");
const XLSX = require("xlsx");

// =========================================================================
// AUTOMATIC INDEX CLEANER (Fixes the E11000 email_1 background crash)
// =========================================================================
setTimeout(async () => {
    try {
        const collection = mongoose.connection.db.collection('hotels');
        const indexes = await collection.indexes();
        const hasOldEmailIndex = indexes.some(idx => idx.name === 'email_1');

        if (hasOldEmailIndex) {
            await collection.dropIndex('email_1');
            console.log("--> Legacy background validation index 'email_1' successfully dropped.");
        }
    } catch (err) {
        console.log("--> Note on background index lookup:", err.message);
    }
}, 5000);

// =========================================================================
// CREATE HOTEL (Production-Level Validations & Correct Status Codes)
// =========================================================================
const createHotel = async (req, res) => {
    try {
        const {
            hotelName,
            hotelEmail,
            city,
            address,
            description,
            hotelType,
            totalRooms,
            amenities,
            adminId,
        } = req.body;

        // ==========================
        // Basic Validation
        // ==========================

        if (!hotelName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Hotel name is required",
            });
        }

        if (hotelName.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Hotel name must be at least 3 characters",
            });
        }

        // ==========================
        // Duplicate Hotel Name
        // ==========================

        const existingHotelName = await hotelModel.findOne({
            hotelName: {
                $regex: new RegExp(
                    `^${hotelName.trim()}$`,
                    "i"
                ),
            },
        });

        if (existingHotelName) {
            return res.status(409).json({
                success: false,
                message: "Hotel name already exists.",
            });
        }

        // ==========================
        // Hotel Email Validation
        // ==========================

        if (!hotelEmail?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Hotel email is required",
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(hotelEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel email format",
            });
        }

        const existingHotel = await hotelModel.findOne({
            hotelEmail: hotelEmail
                .toLowerCase()
                .trim(),
        });

        if (existingHotel) {
            return res.status(409).json({
                success: false,
                message:
                    "Hotel email already exists in system records.",
            });
        }

        // ==========================
        // City Validation
        // ==========================

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City mapping is required",
            });
        }

        const cityExists =
            await cityModel.findById(city);

        if (!cityExists) {
            return res.status(404).json({
                success: false,
                message: "Selected city not found.",
            });
        }

        // ==========================
        // Hotel Type Validation
        // ==========================

        const allowedHotelTypes = [
            "Hotel",
            "Resort",
            "Guest House",
            "Hostel",
            "Villa",
        ];

        if (
            !hotelType ||
            !allowedHotelTypes.includes(hotelType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel type.",
            });
        }

        // ==========================
        // Address Validation
        // ==========================

        if (!address?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Address is required",
            });
        }

        if (address.trim().length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a complete address (min 8 chars)",
            });
        }

        // ==========================
        // Description Validation
        // ==========================

        if (!description?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required",
            });
        }

        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message:
                    "Description must be at least 20 characters",
            });
        }

        // ==========================
        // Total Rooms Validation
        // ==========================

        const roomCount = Number(totalRooms);

        if (
            !totalRooms ||
            !Number.isInteger(roomCount) ||
            roomCount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Total rooms must be a positive integer.",
            });
        }

        // ==========================
        // Admin & Status
        // ==========================

        let assignedAdmin;
        let hotelStatus;

        if (req.user.role === "admin") {

            assignedAdmin = req.user._id;
            hotelStatus = "Pending";

        } else if (req.user.role === "superAdmin") {

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please select an assigned admin",
                });
            }

            const admin =
                await signupModel.findOne({
                    _id: adminId,
                    role: "admin",
                    status: "Approved",
                });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Approved administrator record not found",
                });
            }

            assignedAdmin = admin._id;
            hotelStatus = "Approved";

        } else {

            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized role authorization context",
            });
        }

        // ==========================
        // Image Validation
        // ==========================

        if (!req.files?.hotelImages) {
            return res.status(400).json({
                success: false,
                message:
                    "Hotel media image files are required",
            });
        }

        const images = Array.isArray(
            req.files.hotelImages
        )
            ? req.files.hotelImages
            : [req.files.hotelImages];

        // Minimum 5 Images
        if (images.length < 5) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload a minimum of 5 hotel images",
            });
        }

        // Maximum 10 Images
        if (images.length > 10) {
            return res.status(400).json({
                success: false,
                message:
                    "Maximum 10 hotel images are allowed.",
            });
        }

        // ==========================
        // Upload Images
        // ==========================

        const uploadResult =
            await uploadImage(images);

        if (
            !uploadResult ||
            !uploadResult.length
        ) {
            return res.status(500).json({
                success: false,
                message: "Image upload failed.",
            });
        }

        const hotelImages =
            uploadResult.map(
                (image) => image.secure_url
            );

        // ==========================
        // Amenities
        // ==========================

        let amenitiesArray = [];

        if (Array.isArray(amenities)) {
            amenitiesArray = amenities;
        } else if (
            typeof amenities === "string"
        ) {
            amenitiesArray = amenities
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }

        amenitiesArray =
            amenitiesArray
                .map((item) => item.trim())
                .filter(Boolean);

        if (amenitiesArray.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Select at least one amenity.",
            });
        }

        // ==========================
        // Tracking ID
        // ==========================

        const trackingId = uuidv4();

        // ==========================
        // Create Hotel
        // ==========================

        const hotel =
            await hotelModel.create({
                hotelName:
                    hotelName.trim(),

                hotelEmail:
                    hotelEmail
                        .toLowerCase()
                        .trim(),

                city,

                address:
                    address.trim(),

                description:
                    description.trim(),

                hotelType:
                    hotelType || "Hotel",

                totalRooms:
                    roomCount,

                amenities:
                    amenitiesArray,

                hotelImages,

                trackingId,

                adminId:
                    assignedAdmin,

                status:
                    hotelStatus,
            });

        // ==========================
        // Email
        // ==========================

        if (req.user.role === "admin") {

            await sendEmail(
                hotel.hotelEmail,
                "Hotel Registration Submitted",
                `
                    <h2>Hello,</h2>
                    <p>Your hotel registration request has been submitted successfully for verification review.</p>
                    <p><strong>Tracking ID:</strong> ${trackingId}</p>
                    <p>Please save this Tracking ID to check your audit request processing status anytime.</p>
                `
            );

        } else if (
            req.user.role === "superAdmin"
        ) {

            await sendEmail(
                hotel.hotelEmail,
                "Hotel Created Successfully",
                `
                    <h2>Welcome</h2>
                    <p>Your hotel property has been created directly by the Super Admin authority.</p>
                `
            );
        }

        // ==========================
        // Populate
        // ==========================

        const populatedHotel =
            await hotelModel
                .findById(hotel._id)
                .populate({
                    path: "adminId",
                    select: "name email",
                })
                .populate({
                    path: "city",
                    populate: {
                        path: "districtId",
                        populate: {
                            path: "stateId",
                        },
                    },
                });

        return res.status(201).json({
            success: true,
            message:
                req.user.role === "superAdmin"
                    ? "Hotel created successfully"
                    : "Hotel request submitted successfully",
            hotel: populatedHotel,
        });

    } catch (error) {

        console.log(
            "Create Hotel Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// UNIFIED PIPELINE FOR SEARCH, SORT, FILTER & PAGINATION
// =========================================================================
const handleHotelQueryPipeline = async (req, res, initialFilter) => {
    try {
        const {
            page = 1,
            limit = 6,
            sort = "newest",
            hotelType = "all",
            search = ""
        } = req.query;

        let filter = { ...initialFilter };

        // Restrict non-superadmins or regular admins to their scope
        if (req.user && req.user.role === "admin") {
            filter.adminId = req.user._id;
        }

        // 🔍 Search Filter (Name or Email)
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { hotelName: searchRegex },
                { hotelEmail: searchRegex }
            ];
        }

        // 🏨 Hotel Type Filter
        if (hotelType && hotelType !== "all") {
            filter.hotelType = new RegExp(`^${hotelType}$`, "i");
        }

        // 📊 Sorting Logic
        let sortQuery = { createdAt: -1 }; // default newest
        if (sort === "oldest") sortQuery = { createdAt: 1 };
        else if (sort === "name") sortQuery = { hotelName: 1 };
        else if (sort === "rooms") sortQuery = { totalRooms: -1 };

        // 📄 Pagination Calculation
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 6;
        const skip = (pageNum - 1) * limitNum;

        const total = await hotelModel.countDocuments(filter);
        const hotels = await hotelModel
            .find(filter)
            .populate({ path: "adminId", select: "name email" })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            hotels
        });
    } catch (error) {
        console.log("Hotel Query Pipeline Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET PENDING HOTELS
// =========================================================================
const getPendingHotels = async (req, res) => {
    return await handleHotelQueryPipeline(req, res, { status: "Pending" });
};

// =========================================================================
// GET APPROVED HOTELS
// =========================================================================
const getApprovedHotels = async (req, res) => {
    return await handleHotelQueryPipeline(req, res, { status: "Approved" });
};

// =========================================================================
// GET REJECTED HOTELS
// =========================================================================
const getRejectedHotels = async (req, res) => {
    return await handleHotelQueryPipeline(req, res, { status: "Rejected" });
};

// =========================================================================
// APPROVE HOTEL (Generates User Account & Syncs Credentials)
// =========================================================================
const approveHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password?.trim()) {
            return res.status(400).json({ success: false, message: "Security password is required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel verification record not found" });
        }

        if (hotel.status === "Approved") {
            return res.status(400).json({ success: false, message: "Hotel is already approved" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Sync or create account in signupModel collection
        const existingUserAccount = await signupModel.findOne({ email: hotel.hotelEmail.toLowerCase() });
        if (!existingUserAccount) {
            await signupModel.create({
                name: hotel.hotelName,
                email: hotel.hotelEmail.toLowerCase(),
                password: hashedPassword,
                role: "hotel",
                mobile: "N/A",
                status: "Approved"
            });
        }

        hotel.password = hashedPassword;
        hotel.status = "Approved";
        hotel.remark = "";
        await hotel.save();

        await sendEmail(
            hotel.hotelEmail,
            "Hotel Approved & Account Created",
            `
            <h2>Congratulations 🎉</h2>
            <p>Your hotel onboarding audit has been approved successfully.</p>
            <p><strong>Login Portal Email:</strong> ${hotel.hotelEmail}</p>
            <p><strong>Temporary Passcode:</strong> ${password}</p>
            `
        );

        return res.status(200).json({
            success: true,
            message: "Hotel approved and portal user credentials successfully synchronized."
        });
    } catch (error) {
        console.log("Approve Hotel System Sync Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// REJECT HOTEL
// =========================================================================
const rejectHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;

        if (!remark?.trim()) {
            return res.status(400).json({ success: false, message: "Audit rejection remark reason is required" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }
        if (hotel.status === "Rejected") {
            return res.status(400).json({ success: false, message: "Hotel is already marked as rejected" });
        }
        if (hotel.status === "Approved") {
            return res.status(400).json({ success: false, message: "Approved active hotel cannot be rejected" });
        }

        hotel.status = "Rejected";
        hotel.remark = remark.trim();
        await hotel.save();

        await sendEmail(
            hotel.hotelEmail,
            "Hotel Request Rejected",
            `
            <h2>Hotel Request Dismissed</h2>
            <p>We regret to inform you that your hotel registration request was denied.</p>
            <p><strong>Reason:</strong> ${remark}</p>
            `
        );

        return res.status(200).json({ success: true, message: "Hotel submission rejected successfully" });
    } catch (error) {
        console.log("Reject Hotel Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// UPDATE HOTEL
// =========================================================================
const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            hotelName,
            hotelEmail,
            city,
            address,
            description,
            hotelType,
            totalRooms,
            amenities,
        } = req.body;

        const hotel = await hotelModel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        if (hotel.adminId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this establishment" });
        }

        if (hotel.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending verification hotels can be edited" });
        }

        const verifiedEmail = hotelEmail?.trim() ? hotelEmail.toLowerCase().trim() : hotel.hotelEmail;
        if (verifiedEmail !== hotel.hotelEmail) {
            const existingHotel = await hotelModel.findOne({
                hotelEmail: verifiedEmail,
                _id: { $ne: id },
            });
            if (existingHotel) {
                return res.status(400).json({ success: false, message: "Hotel email already exists" });
            }
        }

        let amenitiesArray = hotel.amenities;
        if (amenities) {
            if (Array.isArray(amenities)) {
                amenitiesArray = amenities.map(item => item.trim()).filter(Boolean);
            } else {
                amenitiesArray = amenities.split(",").map(item => item.trim()).filter(Boolean);
            }
        }

        let hotelImages = hotel.hotelImages;
        if (req.files?.hotelImages) {
            const images = Array.isArray(req.files.hotelImages)
                ? req.files.hotelImages
                : [req.files.hotelImages];

            const uploadResult = await uploadImage(images);
            hotelImages = uploadResult.map((item) => item.secure_url);
        }

        hotel.hotelName = hotelName ? hotelName.trim() : hotel.hotelName;
        hotel.hotelEmail = verifiedEmail;
        hotel.city = city || hotel.city;
        hotel.address = address ? address.trim() : hotel.address;
        hotel.description = description ? description.trim() : hotel.description;
        hotel.hotelType = hotelType || hotel.hotelType;
        hotel.totalRooms = totalRooms || hotel.totalRooms;
        hotel.amenities = amenitiesArray;
        hotel.hotelImages = hotelImages;

        await hotel.save();

        const updatedHotel = await hotelModel.findById(hotel._id).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        });

        return res.status(200).json({
            success: true,
            message: "Hotel updated successfully",
            hotel: updatedHotel,
        });
    } catch (error) {
        console.log("Update Hotel Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET HOTEL BY ID
// =========================================================================
const getHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await hotelModel
            .findById(id)
            .populate({ path: "adminId", select: "name email" })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        if (
            req.user.role !== "superAdmin" &&
            hotel.adminId?._id?.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: "Unauthorized access context" });
        }

        return res.status(200).json({ success: true, hotel });
    } catch (error) {
        console.log("Get Hotel By Id Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET MY HOTELS
// =========================================================================
const getMyHotels = async (req, res) => {
    try {
        const hotels = await hotelModel
            .find({ adminId: req.user._id, isActive: true })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get My Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// TOGGLE STATUS
// =========================================================================
const changeHotelStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await hotelModel.findById(id);

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        hotel.isActive = !hotel.isActive;
        await hotel.save();

        return res.status(200).json({
            success: true,
            message: `Hotel ${hotel.isActive ? "Activated" : "Inactivated"} Successfully`,
        });
    } catch (error) {
        console.log("Change Hotel Status Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET ACTIVE / INACTIVE HOTELS
// =========================================================================
const getActiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ isActive: true }).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInactiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ isActive: false }).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// TRACKING STATUS
// =========================================================================
const checkHotelStatus = async (req, res) => {
    try {
        const { trackingId } = req.body;
        if (!trackingId) {
            return res.status(400).json({ success: false, message: "Tracking ID is required" });
        }

        const hotel = await hotelModel.findOne({ trackingId }).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Invalid Tracking ID" });
        }

        return res.status(200).json({ success: true, message: "Status fetched successfully", data: hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// PARTICULAR HOTEL DASHBOARD
// =========================================================================
const getParticularHotelDashboard = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized token context." });
        }

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email.toLowerCase().trim() })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } }
            });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "No approved hotel specifications mapped to this account." });
        }

        return res.status(200).json({ success: true, message: "Metrics fetched successfully", hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// PUBLIC DIRECTORY & FILTERS
// =========================================================================
const getAllPublicHotels = async (req, res) => {
    try {
        const {
            search = "",
            state = "",
            city = "",
            propertyType = "",
            amenities = "",
            checkIn = "",
            checkOut = "",
            sortBy = "recommended",
            page = 1,
            limit = 6
        } = req.query;

        let query = {
            status: "Approved"
        };

        // ==============================
        // 🔎 Smart Search
        // ==============================
        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            const matchingCities = await cityModel.find(
                { cityName: searchRegex },
                "_id"
            );

            const cityIds = matchingCities.map(c => c._id);

            query.$or = [
                { hotelName: searchRegex },
                { address: searchRegex },
                { city: { $in: cityIds } }
            ];
        }

        // ==============================
        // 🏨 Property Type
        // ==============================
        if (propertyType && propertyType !== "all") {
            query.hotelType = new RegExp(
                `^${propertyType}$`,
                "i"
            );
        }

        // ==============================
        // ✨ Amenities
        // ==============================
        if (amenities) {
            const amenitiesArray = amenities
                .split(",")
                .filter(Boolean);

            if (amenitiesArray.length > 0) {
                query.amenities = {
                    $all: amenitiesArray
                };
            }
        }

        // ==============================
        // 🏨 Get Hotels
        // ==============================
        let hotels = await hotelModel
            .find(query)
            .populate({
                path: "city",
                populate: {
                    path: "districtId",
                    populate: {
                        path: "stateId"
                    }
                }
            });

        // ==============================
        // 📍 State Filter
        // ==============================
        if (state) {
            hotels = hotels.filter(h => {
                const stateName =
                    h.city?.districtId?.stateId?.stateName || "";

                return (
                    stateName.toLowerCase() ===
                    state.toLowerCase()
                );
            });
        }

        // ==============================
        // 📍 City Filter
        // ==============================
        if (city) {
            hotels = hotels.filter(h => {
                const cityName =
                    h.city?.cityName || "";

                return (
                    cityName.toLowerCase() ===
                    city.toLowerCase()
                );
            });
        }

        // ==============================
        // 💰 Get Minimum Available Room Price
        // ==============================
        const hotelsWithPrice = await Promise.all(
            hotels.map(async (hotel) => {

                const cheapestRoom = await roomModel
                    .findOne({
                        hotelId: hotel._id,
                        isActive: true,
                        bookingStatus: "Available"
                    })
                    .sort({
                        pricePerNight: 1
                    })
                    .select("pricePerNight");

                return {
                    ...hotel.toObject(),

                    pricePerNight:
                        cheapestRoom?.pricePerNight || null
                };
            })
        );

        // ==============================
        // 🔃 Sorting
        // ==============================
        hotelsWithPrice.sort((a, b) => {

            const priceA =
                Number(a.pricePerNight || 0);

            const priceB =
                Number(b.pricePerNight || 0);

            const nameA =
                a.hotelName || "";

            const nameB =
                b.hotelName || "";

            if (sortBy === "price-low") {
                return priceA - priceB;
            }

            if (sortBy === "price-high") {
                return priceB - priceA;
            }

            if (sortBy === "name-asc") {
                return nameA.localeCompare(nameB);
            }

            if (sortBy === "name-desc") {
                return nameB.localeCompare(nameA);
            }

            // Recommended
            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );
        });

        // ==============================
        // 📄 Pagination
        // ==============================
        const pageNum =
            Number(page) || 1;

        const limitNum =
            Number(limit) || 6;

        const totalHotels =
            hotelsWithPrice.length;

        const startIndex =
            (pageNum - 1) * limitNum;

        const paginatedHotels =
            hotelsWithPrice.slice(
                startIndex,
                startIndex + limitNum
            );

        // ==============================
        // 📤 Response
        // ==============================
        return res.status(200).json({
            success: true,
            totalHotels,
            hotels: paginatedHotels,
            page: pageNum,
            totalPages:
                Math.ceil(
                    totalHotels / limitNum
                ) || 1
        });

    } catch (error) {

        console.error(
            "Get All Public Hotels Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPublicHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await hotelModel.findOne({ _id: id, status: "Approved" }).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        return res.status(200).json({ success: true, hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllHotels = async (req, res) => {
    try {
        let query = {};

        // Agar normal admin hai toh sirf uske hotels dikhao, superAdmin hai toh sabhi
        if (req.user.role === "admin") {
            query.adminId = req.user._id;
        }

        const hotels = await hotelModel.find(query).populate({
            path: "adminId",
            select: "name email mobile"
        }).populate({
            path: "city",
            populate: { path: "districtId", populate: { path: "stateId" } },
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const validateBulkHotelRow = async (row, req) => {
    const errors = [];

    const hotelName = String(row.hotelName || "").trim();
    const hotelEmail = String(row.hotelEmail || "").trim().toLowerCase();
    const adminEmail = String(row.adminEmail || "").trim().toLowerCase();
    const cityName = String(row.cityName || "").trim().toLowerCase();

    const address = String(row.address || "").trim();
    const description = String(row.description || "").trim();
    const hotelType = String(row.hotelType || "").trim();

    const totalRooms = Number(row.totalRooms);

    const images = [
        row.image1,
        row.image2,
        row.image3,
        row.image4,
        row.image5,
    ]
        .map((image) => String(image || "").trim())
        .filter(Boolean);

    // -------------------------
    // Basic validation
    // -------------------------

    if (!hotelName) {
        errors.push("Hotel name is required");
    } else if (hotelName.length < 3) {
        errors.push("Hotel name must be at least 3 characters");
    }

    if (!hotelEmail) {
        errors.push("Hotel email is required");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(hotelEmail)) {
            errors.push("Invalid hotel email");
        }
    }

    if (!address) {
        errors.push("Address is required");
    }

    if (address && address.length < 8) {
        errors.push("Address must be at least 8 characters");
    }

    if (!description) {
        errors.push("Description is required");
    }

    if (description && description.length < 20) {
        errors.push(
            "Description must be at least 20 characters"
        );
    }

    const allowedHotelTypes = [
        "Hotel",
        "Resort",
        "Guest House",
        "Hostel",
        "Villa",
    ];

    if (!allowedHotelTypes.includes(hotelType)) {
        errors.push("Invalid hotel type");
    }

    if (
        !Number.isInteger(totalRooms) ||
        totalRooms <= 0
    ) {
        errors.push(
            "Total rooms must be a positive integer"
        );
    }

    // -------------------------
    // Minimum 5 images
    // -------------------------

    if (images.length < 5) {
        errors.push(
            "Minimum 5 hotel image links are required"
        );
    }

    // -------------------------
    // Image URL validation
    // -------------------------

    for (const image of images) {
        try {
            new URL(image);
        } catch {
            errors.push(
                `Invalid image URL: ${image}`
            );
        }
    }

    // -------------------------
    // City validation
    // -------------------------

    let city = null;

    if (!cityName) {
        errors.push("City name is required");
    } else {
        city = await cityModel.findOne({
            cityName: cityName,
            status: "Active",
        });

        if (!city) {
            errors.push(
                `City not found: ${cityName}`
            );
        }
    }

    // -------------------------
    // Admin validation
    // -------------------------

    let assignedAdmin = null;

    if (req.user.role === "admin") {

        assignedAdmin = req.user._id;

    } else if (req.user.role === "superAdmin") {

        if (!adminEmail) {
            errors.push("Admin email is required");
        } else {

            assignedAdmin = await signupModel.findOne({
                email: adminEmail,
                role: "admin",
                status: "Approved",
            });

            if (!assignedAdmin) {
                errors.push(
                    `Approved admin not found: ${adminEmail}`
                );
            }
        }

    } else {

        errors.push("Unauthorized role");
    }

    // -------------------------
    // Duplicate checks
    // -------------------------

    if (hotelEmail) {

        const existingEmail =
            await hotelModel.findOne({
                hotelEmail,
            });

        if (existingEmail) {
            errors.push(
                "Hotel email already exists"
            );
        }
    }

    if (hotelName) {

        const existingName =
            await hotelModel.findOne({
                hotelName: {
                    $regex:
                        new RegExp(
                            `^${hotelName}$`,
                            "i"
                        ),
                },
            });

        if (existingName) {
            errors.push(
                "Hotel name already exists"
            );
        }
    }

    return {
        errors,
        city,
        assignedAdmin,
        hotelName,
        hotelEmail,
        address,
        description,
        hotelType,
        totalRooms,
        images,
    };
};

const bulkPreviewHotels = async (req, res) => {
    try {
        console.log("REQ.FILES >>>", req.files);
        console.log("REQ.BODY >>>", req.body);

        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file is required",
            });
        }

        const file = req.files.file;

        console.log("FILE NAME >>>", file.name);
        console.log("FILE SIZE >>>", file.size);

        // Express-fileupload ke saath file.data use hoga
        const workbook = XLSX.read(file.data, {
            type: "buffer",
        });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval: "",
            }
        );

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "Excel file is empty",
            });
        }

        const preview = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const validation =
                await validateBulkHotelRow(row, req);

            preview.push({
                rowNumber: i + 2,

                hotelName:
                    validation.hotelName,

                hotelEmail:
                    validation.hotelEmail,

                cityName:
                    String(
                        row.cityName || ""
                    ).trim(),

                adminEmail:
                    String(
                        row.adminEmail || ""
                    ).trim(),

                status:
                    validation.errors.length === 0
                        ? "Valid"
                        : "Invalid",

                errors:
                    validation.errors,

                originalData: row,
            });
        }

        const validRows =
            preview.filter(
                (row) =>
                    row.status === "Valid"
            ).length;

        const invalidRows =
            preview.filter(
                (row) =>
                    row.status === "Invalid"
            ).length;

        return res.status(200).json({
            success: true,
            totalRows: rows.length,
            validRows,
            invalidRows,
            preview,
        });

    } catch (error) {

        console.log(
            "Bulk Hotel Preview Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const bulkImportHotels = async (req, res) => {
    try {
        let rows = [];

        // 🚀 Support JSON Array from Frontend Preview
        if (req.body?.hotels) {
            try {
                rows = typeof req.body.hotels === "string" ? JSON.parse(req.body.hotels) : req.body.hotels;
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid hotel data format" });
            }
            if (!Array.isArray(rows)) {
                return res.status(400).json({ success: false, message: "Hotels must be an array" });
            }
        }
        // 🚀 Support Direct File Upload Backup
        else if (req.file) {
            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
            return res.status(400).json({ success: false, message: "Excel file or JSON data is required" });
        }

        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No data to import" });
        }

        const imported = [];
        const failed = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                const validation = await validateBulkHotelRow(row, req);

                if (validation.errors.length) {
                    failed.push({
                        rowNumber: i + 2,
                        hotelName: validation.hotelName || row.hotelName || "",
                        errors: validation.errors,
                    });
                    continue;
                }

                const amenities = String(row.amenities || "").split(",").map((item) => item.trim()).filter(Boolean);

                if (!amenities.length) {
                    failed.push({
                        rowNumber: i + 2,
                        hotelName: validation.hotelName,
                        errors: ["At least one amenity is required"],
                    });
                    continue;
                }

                const hotelStatus = req.user.role === "superAdmin" ? "Approved" : "Pending";

                // Ensure uuidv4 is imported at the top of your controller (const { v4: uuidv4 } = require('uuid');)
                const trackingId = uuidv4();

                const hotel = await hotelModel.create({
                    hotelName: validation.hotelName,
                    hotelEmail: validation.hotelEmail,
                    city: validation.city._id,
                    address: validation.address,
                    description: validation.description,
                    hotelType: validation.hotelType,
                    totalRooms: validation.totalRooms,
                    amenities,
                    hotelImages: validation.images,
                    trackingId,
                    adminId: validation.assignedAdmin._id,
                    status: hotelStatus,
                });

                imported.push({
                    rowNumber: i + 2,
                    hotelId: hotel._id,
                    hotelName: hotel.hotelName,
                    trackingId: hotel.trackingId,
                });

            } catch (rowError) {
                failed.push({
                    rowNumber: i + 2,
                    hotelName: row.hotelName || "",
                    errors: [rowError.message],
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Bulk hotel import completed",
            totalRows: rows.length,
            importedCount: imported.length,
            failedCount: failed.length,
            imported,
            failed,
        });

    } catch (error) {
        console.log("Bulk Hotel Import Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;

        // 1. Hotel ko find karo
        const hotel = await hotelModel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found."
            });
        }

        // 2. Role-Based Security Check
        // Agar request ek normal Admin ne ki hai, to check karo ki wo usika hotel hai ya nahi
        if (req.user.role === "admin") {
            if (hotel.adminId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied. You can only delete your own hotels."
                });
            }
        }

        // 3. Delete the Hotel
        await hotelModel.findByIdAndDelete(hotelId);

        // Optional: Agar tum chahte ho ki Hotel delete hone par uske saare Rooms aur Bookings bhi delete ho jayein
        // toh tum yahan unhe bhi delete karwa sakte ho:
        // await Room.deleteMany({ hotelId: hotelId });
        // await Booking.deleteMany({ hotelId: hotelId });

        return res.status(200).json({
            success: true,
            message: "Hotel permanently deleted successfully."
        });

    } catch (error) {
        console.error("Delete Hotel Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the hotel.",
            error: error.message
        });
    }
};

module.exports = {
    createHotel,
    getAllHotels,
    getPendingHotels,
    getApprovedHotels,
    getRejectedHotels,
    approveHotel,
    rejectHotel,
    updateHotel,
    getHotelById,
    getMyHotels,
    changeHotelStatus,
    getActiveHotels,
    getInactiveHotels,
    checkHotelStatus,
    getParticularHotelDashboard,
    getAllPublicHotels,
    getPublicHotelById,
    bulkPreviewHotels,
    bulkImportHotels,
    deleteHotel
};