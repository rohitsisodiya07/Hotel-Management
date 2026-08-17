const SignupModel = require("../Model/signupModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../Utilities/ResendEmail");

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
// 1. SEND SIGNUP OTP (Step 1 of Signup)
// =========================================================================
const sendSignupOtp = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({ success: false, message: "Name, Email and Password are required" });
        }

        name = name.trim();
        email = email.trim().toLowerCase();

        const nameRegex = /^[A-Za-z\s.]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ success: false, message: "Invalid name format. Only letters and spaces are allowed." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address format." });
        }

        if (password.trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }

        const existingUser = await SignupModel.findOne({ email });

        // Block if user exists and is already verified
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ success: false, message: "Email already exists and is active." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        const hash = await bcrypt.hash(password, 10);

        if (!existingUser) {
            // Create new unverified user
            await SignupModel.create({
                name,
                email,
                password: hash,
                otp,
                otpExpire,
                isVerified: false
            });
        } else {
            // Update existing unverified user
            existingUser.name = name;
            existingUser.otp = otp;
            existingUser.otpExpire = otpExpire;
            existingUser.password = hash;
            existingUser.isVerified = false;
            await existingUser.save();
        }

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Please use the secure One-Time Password (OTP) below to complete your registration. This code expires in <strong>5 minutes</strong>.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px dashed #D1D5DB;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0F172A;font-family:monospace;">${otp}</span>
            </div>
            <p style="font-size:14px;color:#6B7280;line-height:1.5;">If you did not initiate this request, please disregard this email.</p>
        `;
        const html = generateAuraStayEmail("Email Verification Code", "Security Verification", emailContent);

        await sendEmail(email, "🔐 Your AuraStay Verification Code", html);

        return res.status(200).json({ success: true, message: "Verification OTP sent successfully to your email" });
    } catch (error) {
        console.error("Send Signup OTP Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// CREATE USER (Fallback)
// =========================================================================
const signup = async (req, res) => {
    return sendSignupOtp(req, res);
};

// =========================================================================
// 2. VERIFY SIGNUP OTP (Step 2 of Signup)
// =========================================================================
const verifySignupOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        email = email.trim().toLowerCase();

        const user = await SignupModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        if (!user.otp || user.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // OTP correct → verify user
        user.otp = null;
        user.otpExpire = null;
        user.isVerified = true;
        await user.save();

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Thank you for registering with AuraStay. Your account has been successfully verified. You now have full access to our curated portfolio of luxury stays.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #E5E7EB;">
                <h3 style="margin-top:0;color:#111827;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Account Summary</h3>
                <p style="margin:8px 0;font-size:14px;color:#4B5563;"><strong>Name:</strong> ${user.name}</p>
                <p style="margin:8px 0;font-size:14px;color:#4B5563;"><strong>Email:</strong> ${user.email}</p>
            </div>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">We are thrilled to accompany you on your travel journeys.</p>
        `;
        const html = generateAuraStayEmail("Welcome Aboard! 🎉", "Executive Collection", emailContent);

        await sendEmail(user.email, "✨ Welcome to AuraStay — Account Verified", html);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        return res.status(201).json({
            success: true,
            message: "Account verified and registered successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Verify Signup OTP Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 3. LOGIN USER (With Verification Check)
// =========================================================================
const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        email = email.trim().toLowerCase();

        const existingUser = await SignupModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        // 🔥 CRITICAL ADDITION: Prevent unverified users from logging in
        if (!existingUser.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });
        }

        const match = await bcrypt.compare(password, existingUser.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Wrong Password" });
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            token,
            user: { id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 4. SEND RECOVERY OTP
// =========================================================================
const sendOtp = async (req, res) => {
    try {
        let { email } = req.body;

        if (!email?.trim()) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        email = email.trim().toLowerCase();

        const existingUser = await SignupModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await SignupModel.findByIdAndUpdate(
            existingUser._id,
            { otp, otpExpire: new Date(Date.now() + 5 * 60 * 1000) }
        );

        const emailContent = `
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Hello <strong>${existingUser.name}</strong>,</p>
            <p style="font-size:15px;color:#4B5563;line-height:1.6;">Use the following code to reset your account password. This code is valid for <strong>5 minutes</strong>.</p>
            <div style="background:#F3F4F6;padding:20px;border-radius:8px;text-align:center;margin:30px 0;border:1px dashed #D1D5DB;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0F172A;font-family:monospace;">${otp}</span>
            </div>
            <p style="font-size:14px;color:#6B7280;line-height:1.5;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        `;
        const html = generateAuraStayEmail("Password Reset Request", "Account Recovery", emailContent);

        await sendEmail(existingUser.email, "🔐 Password Reset OTP — AuraStay", html);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 5. VERIFY RECOVERY OTP
// =========================================================================
const verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        email = email.trim().toLowerCase();

        const existingUser = await SignupModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        if (existingUser.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (existingUser.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP Expired" });
        }

        return res.status(200).json({ success: true, message: "OTP Verified" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 6. FORGOT PASSWORD (Set new password using verified email)
// =========================================================================
const forgotPassword = async (req, res) => {
    try {
        let { email, password, confirmPassword } = req.body;

        if (!email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
            return res.status(400).json({ success: false, message: "Email, Password and Confirm Password are required" });
        }

        email = email.trim().toLowerCase();

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const existingUser = await SignupModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        const isSamePassword = await bcrypt.compare(password, existingUser.password);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as the old password" });
        }

        const hash = await bcrypt.hash(password, 10);

        await SignupModel.findOneAndUpdate(
            { email },
            { password: hash, otp: null, otpExpire: null }
        );

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 7. RESET PASSWORD (Logged in user changing password)
// =========================================================================
const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New passwords do not match" });
        }

        const match = await bcrypt.compare(oldPassword, req.user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }

        const samePassword = await bcrypt.compare(newPassword, req.user.password);
        if (samePassword) {
            return res.status(400).json({ success: false, message: "New password cannot be same as old password" });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await SignupModel.findByIdAndUpdate(req.user._id, { password: hash });

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    signup, sendSignupOtp, verifySignupOtp, login, sendOtp,
    verifyOtp, forgotPassword, resetPassword,
};