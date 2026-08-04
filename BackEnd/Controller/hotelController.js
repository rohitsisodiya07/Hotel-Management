const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const sendEmail = require("../Utilities/NodeMailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel')

// =========================================================================
// AUTOMATIC INDEX CLEANER (💥 Fixes the E11000 email_1 background crash)
// =========================================================================
// Jab bhi server refresh hoga, ye check karega aur agar purana legacy index 
// 'email_1' active hoga, toh use cleanly database collection se drop kar dega.
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
        // Safe fail logging if database connectivity isn't fully ready yet on instant boot
        console.log("--> Note on background index lookup:", err.message);
    }
}, 5000);


// =========================================================================
// CREATE HOTEL
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

        if (!hotelEmail?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Hotel email is required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(hotelEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel email",
            });
        }

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        if (!address?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Address is required",
            });
        }

        if (address.trim().length < 8) {
            return res.status(400).json({
                success: false,
                message: "Please enter complete address",
            });
        }

        if (!description?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required",
            });
        }

        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Description must be at least 20 characters",
            });
        }

        if (!totalRooms || Number(totalRooms) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter valid total rooms",
            });
        }

        const existingHotel = await hotelModel.findOne({
            hotelEmail: hotelEmail.toLowerCase().trim(),
        });

        if (existingHotel) {
            return res.status(400).json({
                success: false,
                message: "Hotel email already exists",
            });
        }

        // ==========================
        // Assign Admin & Status
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
                    message: "Please select an admin",
                });
            }

            const admin = await signupModel.findOne({
                _id: adminId,
                role: "admin",
                status: "Approved",
            });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Approved admin not found",
                });
            }

            assignedAdmin = admin._id;
            hotelStatus = "Approved";
        } else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ==========================
        // Upload Images
        // ==========================

        if (!req.files?.hotelImages) {
            return res.status(400).json({
                success: false,
                message: "Hotel images are required",
            });
        }

        const images = Array.isArray(req.files.hotelImages)
            ? req.files.hotelImages
            : [req.files.hotelImages];

        if (images.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least 3 hotel images",
            });
        }

        const uploadResult = await uploadImage(images);

        const hotelImages = uploadResult.map(
            (image) => image.secure_url
        );

        // ==========================
        // Amenities
        // ==========================

        let amenitiesArray = [];

        if (Array.isArray(amenities)) {
            amenitiesArray = amenities;
        } else if (typeof amenities === "string") {
            amenitiesArray = amenities
                .split(",")
                .map((item) => item.trim());
        }

        const trackingId = uuidv4();

        // ==========================
        // Create Hotel
        // ==========================

        const hotel = await hotelModel.create({
            hotelName: hotelName.trim(),
            hotelEmail: hotelEmail
                .toLowerCase()
                .trim(),
            city,
            address: address.trim(),
            description: description.trim(),
            hotelType: hotelType || "Hotel",
            totalRooms,
            amenities: amenitiesArray,
            hotelImages,
            trackingId,
            adminId: assignedAdmin,
            status: hotelStatus,
        });

        // ==========================
        // Send Email
        // ==========================

        if (req.user.role === "admin") {
            await sendEmail(
                hotel.hotelEmail,
                "Hotel Registration Submitted",
                `
                <h2>Hello,</h2>

                <p>Your hotel registration request has been submitted successfully.</p>

                <p><strong>Tracking ID :</strong> ${trackingId}</p>

                <p>Please save this Tracking ID. You can use it to check your hotel request status.</p>
                `
            );
        }

        if (req.user.role === "superAdmin") {
            await sendEmail(
                hotel.hotelEmail,
                "Hotel Created Successfully",
                `
                <h2>Welcome</h2>

                <p>Your hotel has been created successfully by the Super Admin.</p>

                <p>You can now access the platform once your credentials are generated.</p>
                `
            );
        }

        const populatedHotel = await hotelModel.findById(hotel._id)
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
        console.log("Create Hotel Error :", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// GET PENDING HOTELS
// =========================================================================
const getPendingHotels = async (req, res) => {
    try {
        let filter = { status: "Pending" };
        if (req.user.role === "admin") {
            filter.adminId = req.user._id;
        }

        const hotels = await hotelModel
            .find(filter)
            .populate({ path: "adminId", select: "name email" })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get Pending Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET APPROVED HOTELS
// =========================================================================
const getApprovedHotels = async (req, res) => {
    try {
        let filter = { status: "Approved" };
        if (req.user.role === "admin") {
            filter.adminId = req.user._id;
        }

        const hotels = await hotelModel
            .find(filter)
            .populate({ path: "adminId", select: "name email" })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get Approved Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET REJECTED HOTELS
// =========================================================================
const getRejectedHotels = async (req, res) => {
    try {
        let filter = { status: "Rejected" };
        if (req.user.role === "admin") {
            filter.adminId = req.user._id;
        }

        const hotels = await hotelModel
            .find(filter)
            .populate({ path: "adminId", select: "name email" })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get Rejected Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// APPROVE HOTEL
// =========================================================================
const approveHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password?.trim()) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // 1. Hotel find karein aur check karein
        const hotel = await hotelModel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        if (hotel.status === "Approved") {
            return res.status(400).json({ success: false, message: "Hotel is already approved" });
        }

        // 2. Password ko encrypt/hash karein
        const hashedPassword = await bcrypt.hash(password, 10);

        // =========================================================================
        // AUTOMATIC USER REGISTRATION SYSTEM (Wired for dynamic mapping entry)
        // =========================================================================
        // Check karein ki kya is hotel email ka account user collection me pehle se h ya nahi
        const existingUserAccount = await signupModel.findOne({ email: hotel.hotelEmail.toLowerCase() });

        if (!existingUserAccount) {
            // Agar account nahi h, toh direct main user schema mapping table me document automatically insert hoga
            await signupModel.create({
                name: hotel.hotelName,
                email: hotel.hotelEmail.toLowerCase(),
                password: hashedPassword,
                role: "hotel", // Ya jo bhi role aapne system authorization matrix me likha h
                mobile: "N/A", // Default safe dynamic placeholder data parameter values
                status: "Approved"
            });
            console.log(`--> New platform credential node auto-saved inside User schema for: ${hotel.hotelName}`);
        }

        // 3. Hotel documents variables updates compiler logic
        hotel.password = hashedPassword;
        hotel.status = "Approved";
        hotel.remark = "";

        await hotel.save();

        // 4. Send Notification Alert Credentials Mail
        await sendEmail(
            hotel.hotelEmail,
            "Hotel Approved & Account Created",
            `
            <h2>Congratulations 🎉</h2>
            <p>Your hotel request has been approved and platform portal credentials has been compiled successfully.</p>
            <p><strong>Login Portal Email:</strong> ${hotel.hotelEmail}</p>
            <p><strong>Temporary Passcode:</strong> ${password}</p>
            <p>You can now log into your business management dashboard using these metrics values natively.</p>
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
            return res.status(400).json({ success: false, message: "Remark is required" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }
        if (hotel.status === "Rejected") {
            return res.status(400).json({ success: false, message: "Hotel is already rejected" });
        }
        if (hotel.status === "Approved") {
            return res.status(400).json({ success: false, message: "Approved hotel cannot be rejected" });
        }

        hotel.status = "Rejected";
        hotel.remark = remark.trim();
        await hotel.save();

        await sendEmail(
            hotel.hotelEmail,
            "Hotel Request Rejected",
            `
            <h2>Hotel Request Rejected</h2>
            <p>We regret to inform you that your hotel registration request has been rejected.</p>
            <p><strong>Reason:</strong> ${remark}</p>
            <p>You can update your hotel details and submit the request again.</p>
            `
        );

        return res.status(200).json({ success: true, message: "Hotel rejected successfully" });
    } catch (error) {
        console.log("Reject Hotel Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// UPDATE HOTEL (Wired & Protection layers injected against undefined emails)
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
        // console.log(">>>>>hotelId", hotel);

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        if (hotel.adminId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this hotel" });
        }

        if (hotel.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending hotels can be updated" });
        }

        // Email variables safe validation evaluation checking
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

        let amenitiesArray = hotel.amenities; // Default: purani amenities

        if (amenities) {
            if (Array.isArray(amenities)) {
                amenitiesArray = amenities.map(item => item.trim());
            } else {
                amenitiesArray = amenities
                    .split(",")
                    .map(item => item.trim());
            }
        }

        console.log("Amenities:", amenitiesArray);

        let hotelImages = hotel.hotelImages;
        if (req.files?.hotelImages) {
            const images = Array.isArray(req.files.hotelImages)
                ? req.files.hotelImages
                : [req.files.hotelImages];

            const uploadResult = await uploadImage(images);
            hotelImages = uploadResult.map((item) => item.secure_url);
        }

        hotel.hotelName = hotelName ? hotelName.trim() : hotel.hotelName;
        hotel.hotelEmail = verifiedEmail; // ◄--- Injected absolute protection handler against null conversions
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
            hotel.adminId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
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
// TOGGLE INACTIVE / ACTIVE STATUS
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
// GET ACTIVE HOTELS
// =========================================================================
const getActiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel
            .find({ isActive: true })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get Active Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET INACTIVE HOTELS
// =========================================================================
const getInactiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel
            .find({ isActive: false })
            .populate({
                path: "city",
                populate: { path: "districtId", populate: { path: "stateId" } },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        console.log("Get Inactive Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// CHECK HOTEL TRACKING STATUS
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

        return res.status(200).json({
            success: true,
            message: "Status fetched successfully",
            data: hotel,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET PARTICULAR HOTEL DASHBOARD (💥 Injected Dynamic Filter Mapping)
// =========================================================================
const getParticularHotelDashboard = async (req, res) => {
    try {
        // req.user.email aapke login authentication middleware layer se extract hoga
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized token initialization context." });
        }

        // Particular logged-in hotel ki email se match karke poora data nested collections se fetch karein
        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email.toLowerCase().trim() })
            .populate({
                path: "city",
                populate: {
                    path: "districtId",
                    populate: { path: "stateId" }
                }
            });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "No approved hotel specifications discovered mapping this manager account link."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Particular hotel metrics fetched successfully",
            hotel
        });

    } catch (error) {
        console.log("Get Particular Hotel Dashboard Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllPublicHotels = async (req, res) => {
    try {
        const hotels = await hotelModel
            .find({
                status: "Approved",
            })
            .populate({
                path: "city",
                populate: {
                    path: "districtId",
                    populate: {
                        path: "stateId",
                    },
                },
            })
            .sort({ createdAt: -1 });

        console.log("Public Hotels Count:", hotels.length);
        console.log("Public Hotels:", hotels);

        return res.status(200).json({
            success: true,
            hotels,
        });
    } catch (error) {
        console.log("Public Hotels Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPublicHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Hotel ID:", req.params.id);

        const hotel = await hotelModel
            .findOne({
                _id: id,
                status: "Approved",
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

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
        }

        return res.status(200).json({
            success: true,
            hotel,
        });
    } catch (error) {
        console.log("Public Hotel Details Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =========================================================================
// GET ALL HOTELS (For SuperAdmin Dashboard - Shows all hotels with admins)
// =========================================================================
const getAllHotels = async (req, res) => {
    try {
        const hotels = await hotelModel
            .find({})
            .populate({
                path: "adminId",
                select: "name email mobile"
            })
            .populate({
                path: "city",
                populate: {
                    path: "districtId",
                    populate: { path: "stateId" }
                },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalHotels: hotels.length,
            hotels
        });
    } catch (error) {
        console.log("Get All Hotels Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// =========================================================================
// MODULE EXPORTS (Updated to include the new dynamic node handler)
// =========================================================================
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
    getPublicHotelById
};

