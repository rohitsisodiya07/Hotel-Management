const adminModel = require('../Model/adminModel');
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const sendEmail = require("../Utilities/NodeMailer");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../Utilities/Cloudinary");

// ==========================================
// 1. STEP 1: Send OTP for Admin Signup
// ==========================================
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

        // Check if already approved/existing
        const existingRequest = await adminModel.findOne({ email });
        if (existingRequest && existingRequest.status === "Approved") {
            return res.status(400).json({ success: false, message: "Admin already exists with this email" });
        }

        const existingUser = await signupModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes validity

        // Upsert pending/unverified temporary record
        let pendingAdmin = await adminModel.findOne({ email, status: "Pending" });

        if (!pendingAdmin) {
            pendingAdmin = new adminModel({
                name,
                email,
                mobile,
                profileImage: "https://via.placeholder.com/150", // Temporary placeholder
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

        // Professional Luxury OTP Email Template
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
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
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

// ==========================================
// 2. STEP 2: Verify OTP, Upload Image & Send Tracking ID
// ==========================================
const verifyAndCreateAdmin = async (req, res) => {
    try {
        const { adminId, otp } = req.body;

        if (!adminId || !otp?.trim()) {
            return res.status(400).json({ success: false, message: "Admin ID and OTP are required" });
        }

        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Registration session not found. Please try again." });
        }

        if (admin.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }

        if (admin.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Handle Image Upload if provided in final step
        if (req.files?.profileImage) {
            const profileImage = req.files.profileImage;
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

            if (!allowedTypes.includes(profileImage.mimetype)) {
                return res.status(400).json({ success: false, message: "Only JPG, JPEG, PNG and WEBP images are allowed" });
            }

            if (profileImage.size > 2 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: "Image size should not exceed 2 MB" });
            }

            const uploadedImage = await uploadImage(profileImage);
            admin.profileImage = uploadedImage[0].secure_url;
        }

        // Clear OTP & Finalize Tracking ID
        admin.otp = null;
        admin.otpExpire = null;
        const trackingId = admin.trackingId || uuidv4();
        admin.trackingId = trackingId;
        await admin.save();

        // Professional Submission Success Email with Tracking ID
        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Executive Management</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Application Submitted</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Your email has been verified and your admin registration request is now successfully submitted.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:11px;color:#8C8676;text-transform:uppercase;display:block;margin-bottom:8px;font-weight:bold;">Your Tracking ID</span>
                        <span style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#1B2537;font-family:monospace;">${trackingId}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(admin.email, "🛡️ Admin Application Received — StayFinder", html);

        return res.status(201).json({
            success: true,
            message: "OTP verified successfully. Tracking ID has been sent to your email.",
            admin,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Get Pending Requests
// ==========================================
const getPendingAdminRequests = async (req, res) => {
    try {
        const admins = await adminModel.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: admins.length, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Get Approved Requests
// ==========================================
const getApprovedAdminRequests = async (req, res) => {
    try {
        const admins = await adminModel.find({ status: "Approved" }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: admins.length, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Approve Admin Request
// ==========================================
const approveAdminRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { password } = req.body;

        if (!password?.trim()) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        if (password.trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        session.startTransaction();

        const admin = await adminModel.findById(req.params.id).session(session);
        if (!admin) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (admin.status === "Approved") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Admin already approved" });
        }

        if (admin.status === "Rejected") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Rejected request cannot be approved" });
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
        }], { session });

        admin.status = "Approved";
        admin.remark = "";
        await admin.save({ session });

        await session.commitTransaction();

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Executive Portal</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Account Approved! 🎉</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Your admin application has been approved. You can now log into the management console using your credentials.</p>
                    <div style="background:#F7F6F0;padding:20px;border-radius:12px;margin:25px 0;border:1px solid #E5E2D5;">
                        <p style="margin:6px 0;font-size:13px;color:#555;"><strong>Email:</strong> ${admin.email}</p>
                        <p style="margin:6px 0;font-size:13px;color:#555;"><strong>Temporary Password:</strong> ${password}</p>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(admin.email, "✨ Admin Account Approved — StayFinder", html);

        res.status(200).json({ success: true, message: "Admin approved successfully" });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// ==========================================
// 6. Reject Admin Request
// ==========================================
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

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Application Update</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Request Update</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Unfortunately, your admin registration request could not be approved at this time.</p>
                    <div style="background:#FFF8F7;padding:20px;border-radius:12px;margin:25px 0;border:1px solid #E7C9C3;">
                        <p style="margin:0;font-size:13px;color:#8E3B30;"><strong>Reason:</strong> ${admin.remark}</p>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(admin.email, "⚠️ Admin Request Status Update — StayFinder", html);

        res.status(200).json({ success: true, message: "Request rejected successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. Send Status OTP (Tracker)
// ==========================================
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

        if (admin.otp && admin.otpExpire && admin.otpExpire > Date.now()) {
            return res.status(400).json({ success: false, message: "OTP already sent. Please check your email." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpire = Date.now() + 2 * 60 * 1000; // 2 mins
        await admin.save();

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Security Verification</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Status Verification Code</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Use the secure verification code below to view your admin application status. This code expires in 2 minutes.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(admin.email, "🔐 Verification OTP — StayFinder", html);

        res.status(200).json({ success: true, message: "OTP sent successfully", email: admin.email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 8. Verify Status OTP (Tracker)
// ==========================================
const verifyOtp = async (req, res) => {
    try {
        const { trackingId, otp } = req.body;
        if (!trackingId?.trim() || !otp?.trim()) {
            return res.status(400).json({ success: false, message: "Tracking ID and OTP are required" });
        }

        const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Tracking ID" });
        }

        if (!admin.otp || !admin.otpExpire) {
            return res.status(400).json({ success: false, message: "Please request a new OTP" });
        }

        if (admin.otpExpire < Date.now()) {
            admin.otp = "";
            admin.otpExpire = null;
            await admin.save();
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        if (admin.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        admin.otp = "";
        admin.otpExpire = null;
        await admin.save();

        res.status(200).json({
            success: true,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                mobile: admin.mobile,
                profileImage: admin.profileImage,
                status: admin.status,
                trackingId: admin.trackingId,
                remark: admin.remark,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 9. Get Admin by ID
// ==========================================
const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid request id" });
        }

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({
            success: true,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                mobile: admin.mobile,
                profileImage: admin.profileImage,
                status: admin.status,
                trackingId: admin.trackingId,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 10. Update Request
// ==========================================
const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid request id" });
        }

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (admin.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending requests can be updated" });
        }

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

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Invalid mobile number" });
        }

        if (email !== admin.email) {
            const existing = await adminModel.findOne({ email });
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
        }

        admin.name = name;
        admin.email = email;
        admin.mobile = mobile;

        if (req.files?.profileImage) {
            admin.profileImage = (await uploadImage({ profileImage: req.files.profileImage }))[0].secure_url;
        }

        await admin.save();

        res.status(200).json({ success: true, message: "Request updated successfully", admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 11. Get Rejected Requests
// ==========================================
const getRejectedAdminRequests = async (req, res) => {
    try {
        const admins = await adminModel.find({ status: "Rejected" });
        res.status(200).json({ admins });
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