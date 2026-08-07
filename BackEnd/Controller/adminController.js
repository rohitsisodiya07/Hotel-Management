const adminModel = require('../Model/adminModel');
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const sendEmail = require("../Utilities/NodeMailer");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../Utilities/Cloudinary");

// STEP 1: Send OTP for Admin Signup
const sendAdminSignupOtp = async (req, res) => {
    try {
        let { name, email, mobile } = req.body;

        if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        name = name.trim();
        email = email.trim().toLowerCase();
        mobile = mobile.trim();

        if (!/^[A-Za-z\s.]+$/.test(name)) {
            return res.status(400).json({ success: false, message: "Invalid name" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address" });
        }

        if (!/^[6-9][0-9]{9}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Invalid mobile number" });
        }

        const existingRequest = await adminModel.findOne({ email });
        if (existingRequest && existingRequest.status === "Approved") {
            return res.status(400).json({ success: false, message: "Admin already exists with this email" });
        }

        const existingUser = await signupModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 5 * 60 * 1000;

        let pendingAdmin = await adminModel.findOne({ email, status: "Pending" });

        if (!pendingAdmin) {
            pendingAdmin = new adminModel({
                name,
                email,
                mobile,
                profileImage: "https://via.placeholder.com/150",
                trackingId: uuidv4(),
                status: "Pending",
                otp,
                otpExpire
            });
        } else {
            pendingAdmin.name = name;
            pendingAdmin.mobile = mobile;
            pendingAdmin.otp = otp;
            pendingAdmin.otpExpire = otpExpire;
        }

        await pendingAdmin.save();

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Security Verification</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Email Verification Code</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Please use the secure verification code below to proceed with your admin registration. Valid for 5 minutes.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                </div>
            </div>
        `;

        await sendEmail(email, "🔐 Email Verification OTP — StayFinder", html);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email",
            tempId: pendingAdmin._id
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// STEP 2: Verify OTP, Upload Image & Send Tracking ID
const verifyAndCreateAdmin = async (req, res) => {
    try {
        const { adminId, otp } = req.body;

        if (!adminId || !otp?.trim()) {
            return res.status(400).json({ success: false, message: "Admin ID and OTP are required" });
        }

        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Registration session not found." });
        }

        if (admin.otp !== otp.trim() || admin.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
        }

        if (req.files?.profileImage) {
            const profileImage = req.files.profileImage;
            const uploadedImage = await uploadImage(profileImage);
            admin.profileImage = uploadedImage[0].secure_url;
        }

        admin.otp = null;
        admin.otpExpire = null;
        const trackingId = admin.trackingId || uuidv4();
        admin.trackingId = trackingId;
        await admin.save();

        return res.status(201).json({
            success: true,
            message: "OTP verified successfully. Tracking ID sent to email.",
            admin,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// HELPER FOR SERVER-SIDE SEARCH, PAGINATION & SORTING
const getFilteredAdminsQuery = async (req, status) => {
    const { search = "", page = 1, limit = 10, sort = "newest" } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = { status };

    if (search.trim()) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { trackingId: searchRegex },
            { mobile: searchRegex },
        ];
    }

    let sortOption = { createdAt: -1 };

    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name") sortOption = { name: 1 };

    const admins = await adminModel
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

    const total = await adminModel.countDocuments(query);

    return {
        admins,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

// Get Pending Requests (Backend Pagination & Search)
const getPendingAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Pending");
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Approved Requests (Backend Pagination & Search)
const getApprovedAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Approved");
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Rejected Requests (Backend Pagination & Search)
const getRejectedAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Rejected");

        res.status(200).json({
            success: true,
            ...data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Approve Admin Request
const approveAdminRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { password } = req.body;

        if (!password?.trim() || password.trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        session.startTransaction();

        const admin = await adminModel.findById(req.params.id).session(session);
        if (!admin || admin.status !== "Pending") {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Valid pending request not found" });
        }

        const existingUser = await signupModel.findOne({ email: admin.email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await signupModel.create([{
            name: admin.name,
            email: admin.email,
            password: hashPassword,
            role: "admin",
            status: "Approved"
        }], { session });

        admin.status = "Approved";
        admin.remark = "";
        await admin.save({ session });

        await session.commitTransaction();

        res.status(200).json({ success: true, message: "Admin approved successfully" });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// Reject Admin Request
const rejectAdminRequest = async (req, res) => {
    try {
        const { remark } = req.body;
        if (!remark?.trim()) {
            return res.status(400).json({ success: false, message: "Remark is required" });
        }

        const admin = await adminModel.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        admin.status = "Rejected";
        admin.remark = remark.trim();
        await admin.save();

        res.status(200).json({ success: true, message: "Request rejected successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send Status OTP (Tracker)
const sendOtp = async (req, res) => {
    try {
        const { trackingId } = req.body;
        if (!trackingId?.trim()) {
            return res.status(400).json({ success: false, message: "Tracking ID is required" });
        }

        const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Tracking ID" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpire = Date.now() + 2 * 60 * 1000;
        await admin.save();

        res.status(200).json({ success: true, message: "OTP sent successfully", email: admin.email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Status OTP (Tracker)
const verifyOtp = async (req, res) => {
    try {
        const { trackingId, otp } = req.body;
        const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
        if (!admin || !admin.otp || admin.otpExpire < Date.now() || admin.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        admin.otp = "";
        admin.otpExpire = null;
        await admin.save();

        res.status(200).json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminById = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.params.id);
        if (!admin) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.params.id);
        if (!admin || admin.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Invalid request or not pending" });
        }
        let { name, email, mobile } = req.body;
        admin.name = name?.trim() || admin.name;
        admin.email = email?.trim().toLowerCase() || admin.email;
        admin.mobile = mobile?.trim() || admin.mobile;
        await admin.save();
        res.status(200).json({ success: true, message: "Updated successfully", admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    sendAdminSignupOtp,
    verifyAndCreateAdmin,
    getPendingAdminRequests,
    getApprovedAdminRequests,
    approveAdminRequest,
    rejectAdminRequest,
    sendOtp,
    verifyOtp,
    getAdminById,
    updateRequest,
    getRejectedAdminRequests: getRejectedAdminRequests,
};