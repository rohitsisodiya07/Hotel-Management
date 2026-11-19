const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const { sendEmail } = require("../Utilities/ResendEmail");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const cityModel = require('../Model/cityModel');
const roomModel = require("../Model/roomsModel");
const XLSX = require("xlsx");
const { invalidateDashboardCache } = require("../Utilities/redisClient");

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
// REUSABLE EMAIL TEMPLATE GENERATOR
// =========================================================================
const generateAuraStayEmail = (title, subtitle, content) => `
    <div style="max-width:600px;margin:auto;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;font-family:'Inter',-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1F2937;">
        <div style="background:#0F172A;padding:40px 30px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:1.5px;">AuraStay</h1>
            <p style="color:#D97706;margin:8px 0 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">${subtitle}</p>
        </div>
        <div style="padding:40px;background:#ffffff;">
            <h2 style="color:#111827;margin-top:0;font-size:22px;font-weight:600;">${title}</h2>
            ${content}
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:30px 0;" />
            <p style="font-size:12px;color:#6B7280;text-align:center;margin:0;">
                © ${new Date().getFullYear()} AuraStay. All rights reserved.<br/>
                This is an automated operational message. Please do not reply.
            </p>
        </div>
    </div>
`;

// =========================================================================
// CREATE HOTEL
// =========================================================================
const createHotel = async (req, res) => {
    try {
        const {
            hotelName, hotelEmail, city, address,
            description, hotelType, totalRooms, amenities, adminId,
        } = req.body;

        // --- VALIDATION LOGIC INSIDE FUNCTION ---
        if (!hotelName?.trim() || hotelName.trim().length < 3) {
            return res.status(400).json({ success: false, message: "Hotel name is required and must be at least 3 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!hotelEmail?.trim() || !emailRegex.test(hotelEmail.trim())) {
            return res.status(400).json({ success: false, message: "A valid hotel email is required" });
        }

        if (!city || !mongoose.Types.ObjectId.isValid(city)) {
            return res.status(400).json({ success: false, message: "A valid City mapping ID is required" });
        }

        const allowedHotelTypes = ["Hotel", "Resort", "Guest House", "Hostel", "Villa"];
        if (!hotelType || !allowedHotelTypes.includes(hotelType)) {
            return res.status(400).json({ success: false, message: "Invalid hotel type selected." });
        }

        if (!address?.trim() || address.trim().length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a complete address (min 8 chars)" });
        }

        if (!description?.trim() || description.trim().length < 20) {
            return res.status(400).json({ success: false, message: "Description must be at least 20 characters" });
        }

        const roomCount = Number(totalRooms);
        if (!totalRooms || !Number.isInteger(roomCount) || roomCount <= 0) {
            return res.status(400).json({ success: false, message: "Total rooms must be a positive integer." });
        }

        if (req.user.role === "superAdmin" && (!adminId || !mongoose.Types.ObjectId.isValid(adminId))) {
            return res.status(400).json({ success: false, message: "Please select a valid assigned admin ID" });
        }

        // --- DATABASE CHECKS ---
        const existingHotelName = await hotelModel.findOne({ hotelName: { $regex: new RegExp(`^${hotelName.trim()}$`, "i") } });
        if (existingHotelName) return res.status(409).json({ success: false, message: "Hotel name already exists." });

        const existingHotelEmail = await hotelModel.findOne({ hotelEmail: hotelEmail.toLowerCase().trim() });
        if (existingHotelEmail) return res.status(409).json({ success: false, message: "Hotel email already exists in system records." });

        const cityExists = await cityModel.findById(city);
        if (!cityExists) return res.status(404).json({ success: false, message: "Selected city not found." });

        // --- ADMIN ALLOCATION ---
        let assignedAdmin, hotelStatus;
        if (req.user.role === "admin") {
            assignedAdmin = req.user._id;
            hotelStatus = "Pending";
        } else if (req.user.role === "superAdmin") {
            const admin = await signupModel.findOne({ _id: adminId, role: "admin", status: "Approved" });
            if (!admin) return res.status(404).json({ success: false, message: "Approved administrator record not found" });
            assignedAdmin = admin._id;
            hotelStatus = "Approved";
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized role authorization context" });
        }

        // --- IMAGE VALIDATION ---
        if (!req.files?.hotelImages) return res.status(400).json({ success: false, message: "Hotel media image files are required" });
        const images = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
        if (images.length < 5 || images.length > 10) return res.status(400).json({ success: false, message: "Please upload between 5 and 10 hotel images" });

        const uploadResult = await uploadImage(images);
        if (!uploadResult || !uploadResult.length) return res.status(500).json({ success: false, message: "Image upload failed." });
        const hotelImages = uploadResult.map((image) => image.secure_url);

        // --- AMENITIES ---
        let amenitiesArray = [];
        if (Array.isArray(amenities)) amenitiesArray = amenities;
        else if (typeof amenities === "string") amenitiesArray = amenities.split(",").map((item) => item.trim()).filter(Boolean);
        amenitiesArray = amenitiesArray.map((item) => item.trim()).filter(Boolean);
        if (amenitiesArray.length === 0) return res.status(400).json({ success: false, message: "Select at least one amenity." });

        const trackingId = uuidv4();

        // --- CREATE ---
        const hotel = await hotelModel.create({
            hotelName: hotelName.trim(),
            hotelEmail: hotelEmail.toLowerCase().trim(),
            city, address: address.trim(), description: description.trim(),
            hotelType: hotelType || "Hotel", totalRooms: roomCount,
            amenities: amenitiesArray, hotelImages, trackingId,
            adminId: assignedAdmin, status: hotelStatus,
        });

        // --- EMAIL NOTIFICATION ---
        if (req.user.role === "admin") {
            const emailContent = `
                <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello,</p>
                <p style="font-size:15px;color:#4B5563;line-height:1.6;">Your hotel registration request has been submitted successfully and is under verification review.</p>
                <p style="font-size:15px;color:#4B5563;line-height:1.6;">You can track the status of your application using your unique Tracking ID below:</p>
                <div style="background:#FEF3C7;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px solid #FDE68A;">
                    <span style="font-size:20px;font-weight:700;color:#92400E;font-family:monospace;">${trackingId}</span>
                </div>
            `;
            const html = generateAuraStayEmail("Registration Submitted", "Property Tracker", emailContent);
            await sendEmail(hotel.hotelEmail, "📝 Hotel Registration Submitted — AuraStay", html);
        } else if (req.user.role === "superAdmin") {
            const emailContent = `
                <p style="font-size:15px;color:#4B5563;line-height:1.6;">Welcome to AuraStay!</p>
                <p style="font-size:15px;color:#4B5563;line-height:1.6;">Your property <strong>${hotel.hotelName}</strong> has been successfully registered and approved directly by our administration.</p>
            `;
            const html = generateAuraStayEmail("Property Created", "Welcome Aboard", emailContent);
            await sendEmail(hotel.hotelEmail, "🎉 Hotel Created Successfully — AuraStay", html);
        }

        const populatedHotel = await hotelModel.findById(hotel._id)
            .populate({ path: "adminId", select: "name email" })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } });

        invalidateDashboardCache();

        return res.status(201).json({
            success: true,
            message: req.user.role === "superAdmin" ? "Hotel created successfully" : "Hotel request submitted successfully",
            hotel: populatedHotel,
        });
    } catch (error) {
        console.log("Create Hotel Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// UNIFIED PIPELINE FOR SEARCH, SORT, FILTER & PAGINATION
// =========================================================================
const handleHotelQueryPipeline = async (req, res, initialFilter) => {
    try {
        let { page = 1, limit = 6, sort = "newest", hotelType = "all", search = "" } = req.query;

        // --- VALIDATION LOGIC INSIDE FUNCTION ---
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(Number(limit) || 6, 100)); // Cap limit to 100
        const skip = (pageNum - 1) * limitNum;

        let filter = { ...initialFilter };

        if (req.user && req.user.role === "admin") {
            filter.adminId = req.user._id;
        }

        if (search && search.trim() !== "") {
            const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Sanitize Regex
            const searchRegex = new RegExp(safeSearch, "i");
            filter.$or = [
                { hotelName: searchRegex },
                { hotelEmail: searchRegex }
            ];
        }

        if (hotelType && hotelType !== "all") {
            const safeType = hotelType.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.hotelType = new RegExp(`^${safeType}$`, "i");
        }

        const validSorts = ["newest", "oldest", "name", "rooms"];
        if (!validSorts.includes(sort)) sort = "newest";

        let sortQuery = { createdAt: -1 };
        if (sort === "oldest") sortQuery = { createdAt: 1 };
        else if (sort === "name") sortQuery = { hotelName: 1 };
        else if (sort === "rooms") sortQuery = { totalRooms: -1 };

        const total = await hotelModel.countDocuments(filter);
        const hotels = await hotelModel.find(filter)
            .populate({ path: "adminId", select: "name email" })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } })
            .sort(sortQuery).skip(skip).limit(limitNum);

        return res.status(200).json({
            success: true, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1, hotels
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPendingHotels = async (req, res) => handleHotelQueryPipeline(req, res, { status: "Pending" });
const getApprovedHotels = async (req, res) => handleHotelQueryPipeline(req, res, { status: "Approved" });
const getRejectedHotels = async (req, res) => handleHotelQueryPipeline(req, res, { status: "Rejected" });

// =========================================================================
// APPROVE HOTEL (Generates User Account & Syncs Credentials)
// =========================================================================
const approveHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // --- VALIDATION LOGIC INSIDE FUNCTION ---
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }
        if (!password?.trim() || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password is required and must be at least 6 characters long" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel verification record not found" });
        if (hotel.status === "Approved") return res.status(400).json({ success: false, message: "Hotel is already approved" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUserAccount = await signupModel.findOne({ email: hotel.hotelEmail.toLowerCase() });
        if (!existingUserAccount) {
            await signupModel.create({
                name: hotel.hotelName, email: hotel.hotelEmail.toLowerCase(),
                password: hashedPassword, role: "hotel", mobile: "N/A", status: "Approved"
            });
        } else {
            existingUserAccount.password = hashedPassword;
            existingUserAccount.status = "Approved";
            existingUserAccount.role = "hotel";
            await existingUserAccount.save();
        }

        hotel.password = hashedPassword;
        hotel.status = "Approved";
        hotel.remark = "";
        await hotel.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Congratulations!</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Your hotel onboarding audit for <strong>${hotel.hotelName}</strong> has been approved successfully.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;margin:20px 0;border:1px dashed #D1D5DB;">
                <p style="margin:0 0 10px 0;font-size:15px;color:#374151;"><strong>Portal Login:</strong> ${hotel.hotelEmail}</p>
                <p style="margin:0;font-size:15px;color:#374151;"><strong>Temporary Passcode:</strong> ${password}</p>
            </div>
            <p style="font-size:14px;color:#6B7280;line-height:1.5;">Please log in to your dashboard and change this password immediately.</p>
        `;
        const html = generateAuraStayEmail("Property Approved", "Welcome Aboard", emailContent);
        await sendEmail(hotel.hotelEmail, "🎉 Property Approved & Account Created — AuraStay", html);

        invalidateDashboardCache();

        return res.status(200).json({ success: true, message: "Hotel approved and portal user credentials successfully synchronized." });
    } catch (error) {
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

        // --- VALIDATION LOGIC INSIDE FUNCTION ---
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }
        if (!remark?.trim() || remark.trim().length < 5) {
            return res.status(400).json({ success: false, message: "A valid remark (min 5 characters) is required for rejection" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
        if (hotel.status === "Rejected") return res.status(400).json({ success: false, message: "Hotel is already marked as rejected" });
        if (hotel.status === "Approved") return res.status(400).json({ success: false, message: "Approved active hotel cannot be rejected" });

        hotel.status = "Rejected";
        hotel.remark = remark.trim();
        await hotel.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">We regret to inform you that your registration request for <strong>${hotel.hotelName}</strong> was denied after review.</p>
            <div style="background:#FEF2F2;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #DC2626;">
                <h4 style="margin:0 0 10px 0;color:#991B1B;font-size:14px;text-transform:uppercase;">Reason for Rejection:</h4>
                <p style="margin:0;color:#7F1D1D;font-size:15px;">${hotel.remark}</p>
            </div>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">If you have resolved the issues, you may update and resubmit your application.</p>
        `;
        const html = generateAuraStayEmail("Application Update", "Status: Rejected", emailContent);
        await sendEmail(hotel.hotelEmail, "Update regarding your AuraStay Application", html);

        invalidateDashboardCache();

        return res.status(200).json({ success: true, message: "Hotel submission rejected successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// UPDATE HOTEL
// =========================================================================
const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { hotelName, hotelEmail, city, address, description, hotelType, totalRooms, amenities } = req.body;

        // --- VALIDATION LOGIC INSIDE FUNCTION ---
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        if (hotel.adminId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this establishment" });
        }
        if (hotel.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending verification hotels can be edited" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const verifiedEmail = hotelEmail?.trim() ? hotelEmail.toLowerCase().trim() : hotel.hotelEmail;

        if (hotelEmail && !emailRegex.test(verifiedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (verifiedEmail !== hotel.hotelEmail) {
            const existingHotel = await hotelModel.findOne({ hotelEmail: verifiedEmail, _id: { $ne: id } });
            if (existingHotel) return res.status(400).json({ success: false, message: "Hotel email already exists" });
        }
        if (city && !mongoose.Types.ObjectId.isValid(city)) {
            return res.status(400).json({ success: false, message: "Invalid City ID" });
        }

        let amenitiesArray = hotel.amenities;
        if (amenities) {
            if (Array.isArray(amenities)) amenitiesArray = amenities.map(item => item.trim()).filter(Boolean);
            else amenitiesArray = amenities.split(",").map(item => item.trim()).filter(Boolean);
        }

        let hotelImages = hotel.hotelImages;
        if (req.files?.hotelImages) {
            const images = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
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
            path: "city", populate: { path: "districtId", populate: { path: "stateId" } },
        });

        return res.status(200).json({ success: true, message: "Hotel updated successfully", hotel: updatedHotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET HOTEL BY ID
// =========================================================================
const getHotelById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }

        const hotel = await hotelModel.findById(id)
            .populate({ path: "adminId", select: "name email" })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } });

        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        if (req.user.role !== "superAdmin" && hotel.adminId?._id?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access context" });
        }

        return res.status(200).json({ success: true, hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// GET MY HOTELS & ACTIVE/INACTIVE
// =========================================================================
const getMyHotels = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "Unauthorized token context." });
        }
        const query = req.user.role === "superAdmin" ? {} : { adminId: req.user._id };
        const hotels = await hotelModel.find(query)
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } })
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getActiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ isActive: true })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInactiveHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ isActive: false })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// TOGGLE STATUS
// =========================================================================
const changeHotelStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        hotel.isActive = !hotel.isActive;
        await hotel.save();

        return res.status(200).json({ success: true, message: `Hotel ${hotel.isActive ? "Activated" : "Inactivated"} Successfully` });
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

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!trackingId?.trim() || !uuidRegex.test(trackingId.trim())) {
            return res.status(400).json({ success: false, message: "A valid Tracking ID format is required" });
        }

        const hotel = await hotelModel.findOne({ trackingId: trackingId.trim() })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } });

        if (!hotel) return res.status(404).json({ success: false, message: "Invalid Tracking ID" });

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.user.email)) {
            return res.status(400).json({ success: false, message: "Invalid user email format." });
        }

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email.toLowerCase().trim() })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } });

        if (!hotel) return res.status(404).json({ success: false, message: "No approved hotel specifications mapped to this account." });

        return res.status(200).json({ success: true, message: "Metrics fetched successfully", hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateHotelProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized token context." });
        }

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email.toLowerCase().trim() });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel profile not found for this account." });
        }

        const { hotelName, phone, address, zipCode, description } = req.body;

        if (hotelName) hotel.hotelName = hotelName.trim();
        if (phone) hotel.phone = phone.trim();
        if (address) hotel.address = address.trim();
        if (zipCode) hotel.zipCode = zipCode.trim();
        if (description) hotel.description = description.trim();

        await hotel.save();

        const updatedHotel = await hotelModel.findById(hotel._id)
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } });

        return res.status(200).json({
            success: true,
            message: "Hotel profile updated successfully",
            hotel: updatedHotel
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// PUBLIC DIRECTORY & FILTERS
// =========================================================================
const getAllPublicHotels = async (req, res) => {
    try {
        let {
            search = "",
            state = "",
            city = "",
            propertyType = "",
            amenities = "",
            sortBy = "recommended",
            page = 1,
            limit = 6,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(
            1,
            Math.min(parseInt(limit, 10) || 6, 100)
        );
        const skip = (pageNum - 1) * limitNum;

        const escapeRegex = (value) =>
            String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const query = { status: "Approved" };
        const andConditions = [];

        const searchText = String(search || "").trim();
        const stateText = String(state || "").trim();
        const cityText = String(city || "").trim();
        const propertyTypeText = String(propertyType || "").trim();

        const amenitiesArray = String(amenities || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        // 1. Resolve state and city filters
        let locationCityIds = null;

        if (stateText || cityText) {
            const cityQuery = {};

            if (cityText) {
                cityQuery.cityName = new RegExp(
                    `^${escapeRegex(cityText)}$`,
                    "i"
                );
            }

            let cityDocs = await cityModel
                .find(cityQuery)
                .select("_id cityName districtId")
                .populate({
                    path: "districtId",
                    select: "stateId",
                    populate: {
                        path: "stateId",
                        select: "stateName",
                    },
                })
                .lean();

            if (stateText) {
                cityDocs = cityDocs.filter(
                    (item) =>
                        item.districtId?.stateId?.stateName?.toLowerCase() ===
                        stateText.toLowerCase()
                );
            }

            locationCityIds = cityDocs.map((item) => item._id);

            if (locationCityIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    totalHotels: 0,
                    hotels: [],
                    page: pageNum,
                    totalPages: 0,
                });
            }

            andConditions.push({
                city: { $in: locationCityIds },
            });
        }

        // 2. Search filter
        if (searchText) {
            const searchRegex = new RegExp(
                escapeRegex(searchText),
                "i"
            );

            const matchingCities = await cityModel
                .find({ cityName: searchRegex })
                .select("_id")
                .lean();

            let matchingCityIds = matchingCities.map(
                (item) => item._id
            );

            if (locationCityIds) {
                const allowedIds = new Set(
                    locationCityIds.map((id) => id.toString())
                );

                matchingCityIds = matchingCityIds.filter((id) =>
                    allowedIds.has(id.toString())
                );
            }

            const searchConditions = [
                { hotelName: searchRegex },
                { address: searchRegex },
            ];

            if (matchingCityIds.length > 0) {
                searchConditions.push({
                    city: { $in: matchingCityIds },
                });
            }

            andConditions.push({
                $or: searchConditions,
            });
        }

        // 3. Property type filter
        if (
            propertyTypeText &&
            propertyTypeText !== "all"
        ) {
            query.hotelType = new RegExp(
                `^${escapeRegex(propertyTypeText)}$`,
                "i"
            );
        }

        // 4. Amenities filter
        if (amenitiesArray.length > 0) {
            query.amenities = {
                $all: amenitiesArray,
            };
        }

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        // 5. Sorting
        const validSorts = [
            "recommended",
            "price-low",
            "price-high",
            "name-asc",
            "name-desc",
        ];

        if (!validSorts.includes(sortBy)) {
            sortBy = "recommended";
        }

        const sortQuery = {
            recommended: { createdAt: -1 },
            "name-asc": { hotelName: 1 },
            "name-desc": { hotelName: -1 },
        };

        // 6. Count and fetch paginated hotel data
        const [totalHotels, pagePriceRows] = await Promise.all([
            hotelModel.countDocuments(query),

            hotelModel.aggregate([
                {
                    $match: query,
                },
                {
                    $lookup: {
                        from: roomModel.collection.name,
                        let: {
                            currentHotelId: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [
                                            "$hotelId",
                                            "$$currentHotelId",
                                        ],
                                    },
                                    isActive: true,
                                    bookingStatus: "Available",
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    pricePerNight: {
                                        $min: "$pricePerNight",
                                    },
                                },
                            },
                        ],
                        as: "roomPrice",
                    },
                },
                {
                    $addFields: {
                        pricePerNight: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        "$roomPrice.pricePerNight",
                                        0,
                                    ],
                                },
                                null,
                            ],
                        },
                    },
                },
                {
                    $sort:
                        sortBy === "price-low"
                            ? {
                                pricePerNight: 1,
                                createdAt: -1,
                            }
                            : sortBy === "price-high"
                                ? {
                                    pricePerNight: -1,
                                    createdAt: -1,
                                }
                                : sortQuery[sortBy],
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limitNum,
                },
                {
                    $project: {
                        _id: 1,
                        pricePerNight: 1,
                    },
                },
            ]),
        ]);

        // 7. Get only current page hotels
        const hotelIds = pagePriceRows.map(
            (item) => item._id
        );

        if (hotelIds.length === 0) {
            return res.status(200).json({
                success: true,
                totalHotels,
                hotels: [],
                page: pageNum,
                totalPages: Math.ceil(totalHotels / limitNum) || 1,
            });
        }

        const populatedHotels = await hotelModel
            .find({
                _id: { $in: hotelIds },
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
            .lean();

        // 8. Preserve aggregation sorting order
        const hotelsById = new Map(
            populatedHotels.map((hotel) => [
                hotel._id.toString(),
                hotel,
            ])
        );

        const hotels = pagePriceRows
            .map((row) => {
                const hotel = hotelsById.get(
                    row._id.toString()
                );

                return hotel
                    ? {
                        ...hotel,
                        pricePerNight: row.pricePerNight ?? null,
                    }
                    : null;
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            totalHotels,
            hotels,
            page: pageNum,
            totalPages: Math.ceil(totalHotels / limitNum) || 1,
        });

    } catch (error) {
        console.error(
            "Get All Public Hotels Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch hotels at the moment.",
        });
    }
};

const getPublicHotelById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }

        const hotel = await hotelModel.findOne({ _id: id, status: "Approved" }).populate({
            path: "city", populate: { path: "districtId", populate: { path: "stateId" } },
        });

        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
        return res.status(200).json({ success: true, hotel });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllHotels = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "admin") query.adminId = req.user._id;

        const hotels = await hotelModel.find(query)
            .populate({ path: "adminId", select: "name email mobile" })
            .populate({ path: "city", populate: { path: "districtId", populate: { path: "stateId" } } })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, totalHotels: hotels.length, hotels });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// BULK UPLOAD HANDLERS
// =========================================================================
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

    const images = [row.image1, row.image2, row.image3, row.image4, row.image5].map((image) => String(image || "").trim()).filter(Boolean);

    if (!hotelName) errors.push("Hotel name is required");
    else if (hotelName.length < 3) errors.push("Hotel name must be at least 3 characters");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!hotelEmail) errors.push("Hotel email is required");
    else if (!emailRegex.test(hotelEmail)) errors.push("Invalid hotel email");

    if (!address) errors.push("Address is required");
    else if (address.length < 8) errors.push("Address must be at least 8 characters");

    if (!description) errors.push("Description is required");
    else if (description.length < 20) errors.push("Description must be at least 20 characters");

    const allowedHotelTypes = ["Hotel", "Resort", "Guest House", "Hostel", "Villa"];
    if (!allowedHotelTypes.includes(hotelType)) errors.push("Invalid hotel type");

    if (!Number.isInteger(totalRooms) || totalRooms <= 0) errors.push("Total rooms must be a positive integer");

    if (images.length < 5) errors.push("Minimum 5 hotel image links are required");

    for (const image of images) {
        try { new URL(image); }
        catch { errors.push(`Invalid image URL: ${image}`); }
    }

    let city = null;
    if (!cityName) errors.push("City name is required");
    else {
        city = await cityModel.findOne({ cityName: cityName, status: "Active" });
        if (!city) errors.push(`City not found or inactive: ${cityName}`);
    }

    let assignedAdmin = null;
    if (req.user.role === "admin") {
        assignedAdmin = req.user._id;
    } else if (req.user.role === "superAdmin") {
        if (!adminEmail) errors.push("Admin email is required");
        else {
            assignedAdmin = await signupModel.findOne({ email: adminEmail, role: "admin", status: "Approved" });
            if (!assignedAdmin) errors.push(`Approved admin not found: ${adminEmail}`);
        }
    } else {
        errors.push("Unauthorized role");
    }

    if (hotelEmail) {
        const existingEmail = await hotelModel.findOne({ hotelEmail });
        if (existingEmail) errors.push("Hotel email already exists");
    }

    if (hotelName) {
        const safeName = hotelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingName = await hotelModel.findOne({ hotelName: { $regex: new RegExp(`^${safeName}$`, "i") } });
        if (existingName) errors.push("Hotel name already exists");
    }

    return { errors, city, assignedAdmin, hotelName, hotelEmail, address, description, hotelType, totalRooms, images };
};

const bulkPreviewHotels = async (req, res) => {
    try {
        if (!req.files || !req.files.file) return res.status(400).json({ success: false, message: "Excel file is required" });

        const workbook = XLSX.read(req.files.file.data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rows.length) return res.status(400).json({ success: false, message: "Excel file is empty" });

        const preview = [];
        for (let i = 0; i < rows.length; i++) {
            const validation = await validateBulkHotelRow(rows[i], req);
            preview.push({
                rowNumber: i + 2,
                hotelName: validation.hotelName,
                hotelEmail: validation.hotelEmail,
                cityName: String(rows[i].cityName || "").trim(),
                adminEmail: String(rows[i].adminEmail || "").trim(),
                status: validation.errors.length === 0 ? "Valid" : "Invalid",
                errors: validation.errors,
                originalData: rows[i],
            });
        }

        const validRows = preview.filter((row) => row.status === "Valid").length;
        const invalidRows = preview.filter((row) => row.status === "Invalid").length;

        return res.status(200).json({ success: true, totalRows: rows.length, validRows, invalidRows, preview });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const bulkImportHotels = async (req, res) => {
    try {
        let rows = [];

        if (req.body?.hotels) {
            try { rows = typeof req.body.hotels === "string" ? JSON.parse(req.body.hotels) : req.body.hotels; }
            catch (error) { return res.status(400).json({ success: false, message: "Invalid hotel data format" }); }
            if (!Array.isArray(rows)) return res.status(400).json({ success: false, message: "Hotels must be an array" });
        } else if (req.file) {
            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
            return res.status(400).json({ success: false, message: "Excel file or JSON data is required" });
        }

        if (!rows.length) return res.status(400).json({ success: false, message: "No data to import" });

        const imported = [];
        const failed = [];

        for (let i = 0; i < rows.length; i++) {
            try {
                const validation = await validateBulkHotelRow(rows[i], req);

                if (validation.errors.length) {
                    failed.push({ rowNumber: i + 2, hotelName: validation.hotelName || rows[i].hotelName || "", errors: validation.errors });
                    continue;
                }

                const amenities = String(rows[i].amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
                if (!amenities.length) {
                    failed.push({ rowNumber: i + 2, hotelName: validation.hotelName, errors: ["At least one amenity is required"] });
                    continue;
                }

                const hotelStatus = req.user.role === "superAdmin" ? "Approved" : "Pending";
                const trackingId = uuidv4();

                const hotel = await hotelModel.create({
                    hotelName: validation.hotelName, hotelEmail: validation.hotelEmail, city: validation.city._id,
                    address: validation.address, description: validation.description, hotelType: validation.hotelType,
                    totalRooms: validation.totalRooms, amenities, hotelImages: validation.images, trackingId,
                    adminId: validation.assignedAdmin?._id || validation.assignedAdmin, status: hotelStatus,
                });

                imported.push({ rowNumber: i + 2, hotelId: hotel._id, hotelName: hotel.hotelName, trackingId: hotel.trackingId });
            } catch (rowError) {
                failed.push({ rowNumber: i + 2, hotelName: rows[i].hotelName || "", errors: [rowError.message] });
            }
        }

        return res.status(201).json({ success: true, message: "Bulk hotel import completed", totalRows: rows.length, importedCount: imported.length, failedCount: failed.length, imported, failed });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Hotel ID is required" });
        }

        const hotel = await hotelModel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });

        if (req.user.role === "admin") {
            if (hotel.adminId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "Access Denied. You can only delete your own hotels." });
            }
        }

        // Cascade clean up associated rooms and hotel portal credentials
        await roomModel.deleteMany({ hotelId: id });
        if (hotel.hotelEmail) {
            await signupModel.deleteOne({ email: hotel.hotelEmail.toLowerCase(), role: "hotel" });
        }

        await hotelModel.findByIdAndDelete(id);

        invalidateDashboardCache();

        return res.status(200).json({ success: true, message: "Hotel and associated rooms permanently deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error occurred while deleting the hotel.", error: error.message });
    }
};

module.exports = {
    createHotel, getAllHotels, getPendingHotels, getApprovedHotels, getRejectedHotels,
    approveHotel, rejectHotel, updateHotel, getHotelById, getMyHotels, changeHotelStatus,
    getActiveHotels, getInactiveHotels, checkHotelStatus, getParticularHotelDashboard, updateHotelProfile,
    getAllPublicHotels, getPublicHotelById, bulkPreviewHotels, bulkImportHotels, deleteHotel
};