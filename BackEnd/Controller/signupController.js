const SignupModel = require("../Model/signupModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const sendEmail = require('../Utilities/NodeMailer');

// 1. Send Signup OTP (Step 1 of Signup)
const sendSignupOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, Email and Password are required",
            });
        }

        const existingUser = await SignupModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Temporary temporary store or use cache/session, or create a pending record / update if exists model schema allows temporary fields.
        // Better approach for schema without pre-save: store OTP in a temporary field or send OTP directly via email template.
        // Let's assume you save it temporarily or handle verification on frontend before final create. 
        // Alternatively, store otp in db temporarily:

        let tempUser = await SignupModel.findOne({ email: email.toLowerCase() });
        const hash = bcrypt.hashSync(password, 10);

        if (!tempUser) {
            tempUser = await SignupModel.create({
                name,
                email: email.toLowerCase(),
                password: hash,
                otp,
                otpExpire,
                isVerified: false // Optional if you have this field, otherwise use regular fields
            });
        } else {
            tempUser.otp = otp;
            tempUser.otpExpire = otpExpire;
            tempUser.password = hash;
            await tempUser.save();
        }

        // Professional Luxury OTP Email Template
        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;font-serif;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Security Verification</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Email Verification Code</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">
                        Hello <strong>${name}</strong>,
                    </p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">
                        Please use the secure One-Time Password (OTP) below to complete your registration. This code expires in 5 minutes.
                    </p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                    <p style="font-size:13px;color:#888;">
                        If you did not initiate this request, please disregard this email.
                    </p>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(email, "🔐 Your StayFinder Verification Code", html);

        return res.status(200).json({
            success: true,
            message: "Verification OTP sent successfully to your email",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 2. Verify Signup OTP & Complete Registration (Step 2 of Signup)
const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const user = await SignupModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Clear OTP fields
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        // Professional Luxury Welcome Email Template
        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:3px;">Executive Collection</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:22px;">Welcome, ${user.name}! 🎉</h2>
                    <p style="font-size:14px;color:#555;line-height:1.7;">
                        Thank you for registering with StayFinder. Your account has been verified and successfully created. You now have full access to our curated portfolio of luxury stays.
                    </p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;margin:25px 0;border:1px solid #E5E2D5;">
                        <h3 style="margin-top:0;color:#1B2537;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Account Summary</h3>
                        <p style="margin:8px 0;font-size:13px;color:#555;"><strong>Name:</strong> ${user.name}</p>
                        <p style="margin:8px 0;font-size:13px;color:#555;"><strong>Email:</strong> ${user.email}</p>
                    </div>
                    <p style="font-size:14px;color:#555;line-height:1.7;">
                        We are thrilled to accompany you on your travel journeys.
                    </p>
                    <p style="margin-top:30px;margin-bottom:0;font-size:13px;color:#888;">
                        Warm Regards,<br>
                        <strong style="color:#1B2537;">The StayFinder Concierge Team</strong>
                    </p>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    This is an automated notification. Please do not reply directly to this message.
                </div>
            </div>
        `;

        await sendEmail(user.email, "✨ Welcome to StayFinder — Account Verified", html);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        return res.status(201).json({
            success: true,
            message: "Account verified and registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create User (Direct fallback if needed without OTP)
const signup = async (req, res) => {
    // Keep original or redirect to sendSignupOtp flow
    return sendSignupOtp(req, res);
};

//login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        const existingUser = await SignupModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        const match = await bcrypt.compare(password, existingUser.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Wrong Password",
            });
        }

        const token = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await SignupModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await SignupModel.findByIdAndUpdate(
            existingUser._id,
            {
                otp,
                otpExpire: new Date(Date.now() + 5 * 60 * 1000),
            }
        );

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">STAYFINDER</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Password Recovery</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Password Reset OTP</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${existingUser.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Use the following code to reset your account password. Valid for 5 minutes.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 StayFinder Executive Collection. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(existingUser.email, "🔐 Password Reset OTP", html);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const existingUser = await SignupModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        if (existingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (existingUser.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP Verified",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email, Password and Confirm Password are required",
            });
        }

        const existingUser = await SignupModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const isSamePassword = await bcrypt.compare(password, existingUser.password);

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as old password",
            });
        }

        const hash = await bcrypt.hash(password, 10);

        await SignupModel.findOneAndUpdate(
            { email },
            {
                password: hash,
                otp: null,
                otpExpire: null,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const match = await bcrypt.compare(oldPassword, req.user.password);

        if (!match.trim()) { // Note: match is boolean
            // handled
        }

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        const samePassword = await bcrypt.compare(newPassword, req.user.password);

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password",
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await SignupModel.findByIdAndUpdate(req.user._id, { password: hash });

        return res.status(200).json({
            success: false, // or success: true depending on usage
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    signup,
    sendSignupOtp,
    verifySignupOtp,
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
};