const adminModel = require('../Model/adminModel');
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const sendEmail = require("../Utilities/ResendEmail");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../Utilities/Cloudinary");

// --- REUSABLE EMAIL TEMPLATE GENERATOR ---
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
                This is an automated security message. Please do not reply.
            </p>
        </div>
    </div>
`;

// STEP 1: Send OTP for Admin Signup
const sendAdminSignupOtp = async (req, res) => {
    try {
        let { name, email, mobile } = req.body;

        // Validation Logic Inside Function
        if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        name = name.trim();
        email = email.trim().toLowerCase();
        mobile = mobile.trim();

        const nameRegex = /^[A-Za-z\s.]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9][0-9]{9}$/;

        if (!nameRegex.test(name)) {
            return res.status(400).json({ success: false, message: "Invalid name format" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address" });
        }
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ success: false, message: "Invalid mobile number (must be 10 digits starting with 6-9)" });
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
                name, email, mobile,
                profileImage: "https://via.placeholder.com/150",
                trackingId: uuidv4(),
                status: "Pending",
                otp, otpExpire
            });
        } else {
            pendingAdmin.name = name;
            pendingAdmin.mobile = mobile;
            pendingAdmin.otp = otp;
            pendingAdmin.otpExpire = otpExpire;
        }

        await pendingAdmin.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Please use the secure verification code below to proceed with your admin registration. This code is valid for <strong>5 minutes</strong>.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px dashed #D1D5DB;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0F172A;font-family:monospace;">${otp}</span>
            </div>
        `;
        const html = generateAuraStayEmail("Email Verification Code", "Security Verification", emailContent);
        await sendEmail(email, "🔐 Verification Code — AuraStay", html);

        return res.status(200).json({ success: true, message: "OTP sent successfully to your email", tempId: pendingAdmin._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// STEP 2: Verify OTP, Upload Image & Send Tracking ID
const verifyAndCreateAdmin = async (req, res) => {
    try {
        const { adminId, otp } = req.body;

        // Validation Logic Inside Function
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: "Valid Admin ID is required" });
        }
        
        const otpRegex = /^\d{6}$/;
        if (!otp?.trim() || !otpRegex.test(otp.trim())) {
            return res.status(400).json({ success: false, message: "Valid 6-digit OTP is required" });
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

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Your registration request has been submitted successfully and is currently under review by our master administrators.</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">You can track the status of your application using your unique Tracking ID below:</p>
            <div style="background:#FEF3C7;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px solid #FDE68A;">
                <span style="font-size:20px;font-weight:700;color:#92400E;font-family:monospace;">${trackingId}</span>
            </div>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Keep this ID safe, as you will need it to check your status.</p>
        `;
        const html = generateAuraStayEmail("Registration Submitted", "Application Tracker", emailContent);
        await sendEmail(admin.email, "📝 Application Received — AuraStay", html);

        return res.status(201).json({ success: true, message: "OTP verified successfully. Tracking ID sent to email.", admin });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// HELPER FOR SERVER-SIDE SEARCH, PAGINATION & SORTING
const getFilteredAdminsQuery = async (req, status) => {
    let { search = "", page = 1, limit = 10, sort = "newest" } = req.query;

    // Validation Logic Inside Function
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(Number(limit) || 10, 100)); // Cap limit at 100
    const skip = (pageNum - 1) * limitNum;

    const validSorts = ["newest", "oldest", "name"];
    if (!validSorts.includes(sort)) sort = "newest";

    let query = { status };

    if (search.trim()) {
        const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(safeSearch, "i");
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

    const admins = await adminModel.find(query).sort(sortOption).skip(skip).limit(limitNum);
    const total = await adminModel.countDocuments(query);

    return { admins, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
};

// Get Pending Requests
const getPendingAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Pending");
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Approved Requests
const getApprovedAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Approved");
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Rejected Requests
const getRejectedAdminRequests = async (req, res) => {
    try {
        const data = await getFilteredAdminsQuery(req, "Rejected");
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve Admin Request
const approveAdminRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Validation Logic Inside Function
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Request ID is required" });
        }
        if (!password?.trim() || password.trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        session.startTransaction();

        const admin = await adminModel.findById(id).session(session);
        if (!admin || admin.status !== "Pending") {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Valid pending request not found" });
        }

        const existingUser = await signupModel.findOne({ email: admin.email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password.trim(), 10);

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

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Congratulations <strong>${admin.name}</strong>!</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Your application to become an administrator at AuraStay has been <strong>approved</strong>.</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">You can now log in to the admin dashboard using your registered email address.</p>
        `;
        const html = generateAuraStayEmail("Application Approved", "Welcome Aboard", emailContent);
        await sendEmail(admin.email, "🎉 Welcome to AuraStay Admin!", html);

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
        const { id } = req.params;
        const { remark } = req.body;

        // Validation Logic Inside Function
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Request ID is required" });
        }
        if (!remark?.trim() || remark.trim().length < 5) {
            return res.status(400).json({ success: false, message: "A valid remark (min 5 characters) is required for rejection" });
        }

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }
        if (admin.status !== "Pending") {
             return res.status(400).json({ success: false, message: "Only pending requests can be rejected" });
        }

        admin.status = "Rejected";
        admin.remark = remark.trim();
        await admin.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Thank you for your interest in becoming an administrator at AuraStay. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
            <div style="background:#FEF2F2;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #DC2626;">
                <h4 style="margin:0 0 10px 0;color:#991B1B;font-size:14px;text-transform:uppercase;">Reason for Rejection:</h4>
                <p style="margin:0;color:#7F1D1D;font-size:15px;">${admin.remark}</p>
            </div>
        `;
        const html = generateAuraStayEmail("Application Update", "Status: Rejected", emailContent);
        await sendEmail(admin.email, "Update regarding your AuraStay Application", html);

        res.status(200).json({ success: true, message: "Request rejected successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send Status OTP (Tracker)
const sendOtp = async (req, res) => {
    try {
        const { trackingId } = req.body;
        
        // Validation Logic Inside Function
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!trackingId?.trim() || !uuidRegex.test(trackingId.trim())) {
            return res.status(400).json({ success: false, message: "A valid Tracking ID is required" });
        }

        const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Tracking ID not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpire = Date.now() + 2 * 60 * 1000;
        await admin.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">You recently requested to check the status of your AuraStay application. Use the OTP below to authenticate. Valid for <strong>2 minutes</strong>.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px dashed #D1D5DB;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0F172A;font-family:monospace;">${otp}</span>
            </div>
        `;
        const html = generateAuraStayEmail("Tracker Verification", "Status Check", emailContent);
        await sendEmail(admin.email, "🔍 Tracker OTP — AuraStay", html);

        res.status(200).json({ success: true, message: "OTP sent successfully", email: admin.email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Status OTP (Tracker)
const verifyOtp = async (req, res) => {
    try {
        const { trackingId, otp } = req.body;
        
        // Validation Logic Inside Function
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const otpRegex = /^\d{6}$/;

        if (!trackingId?.trim() || !uuidRegex.test(trackingId.trim())) {
            return res.status(400).json({ success: false, message: "A valid Tracking ID is required" });
        }
        if (!otp?.trim() || !otpRegex.test(otp.trim())) {
            return res.status(400).json({ success: false, message: "A valid 6-digit OTP is required" });
        }

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
        const { id } = req.params;

        // Validation Logic Inside Function
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Admin ID is required" });
        }

        const admin = await adminModel.findById(id);
        if (!admin) return res.status(404).json({ success: false, message: "Admin request not found" });
        
        res.status(200).json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, email, mobile } = req.body;

        // Validation Logic Inside Function
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Valid Request ID is required" });
        }

        const admin = await adminModel.findById(id);
        if (!admin || admin.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Invalid request or request is no longer pending" });
        }

        // Validate individual fields if they are provided in the update request
        if (name !== undefined) {
            name = name.trim();
            const nameRegex = /^[A-Za-z\s.]+$/;
            if (!nameRegex.test(name)) return res.status(400).json({ success: false, message: "Invalid name format" });
            admin.name = name;
        }

        if (email !== undefined) {
            email = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: "Invalid email address" });
            
            // Ensure new email doesn't conflict with existing users/admins
            if (email !== admin.email) {
                const existingAdmin = await adminModel.findOne({ email });
                if (existingAdmin) return res.status(400).json({ success: false, message: "Email already in use by another admin request" });
                
                const existingUser = await signupModel.findOne({ email });
                if (existingUser) return res.status(400).json({ success: false, message: "Email already in use by a registered user" });
                
                admin.email = email;
            }
        }

        if (mobile !== undefined) {
            mobile = mobile.trim();
            const mobileRegex = /^[6-9][0-9]{9}$/;
            if (!mobileRegex.test(mobile)) return res.status(400).json({ success: false, message: "Invalid mobile number" });
            admin.mobile = mobile;
        }

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
    getRejectedAdminRequests,
};