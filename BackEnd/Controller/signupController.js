const SignupModel = require("../Model/signupModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const sendEmail = require('../Utilities/NodeMailer')

// Create User
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, Email and Password are required",
            });
        }

        // Check if email already exists
        const existingUser = await SignupModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Hash Password
        const hash = bcrypt.hashSync(password, 10);

        // Create User
        const result = await SignupModel.create({
            name,
            email,
            password: hash,
        });

        // Welcome Email Template
        const html = `
      <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;">

        <div style="background:#4F46E5;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;">
            Welcome, ${result.name}! 🎉
          </h1>
        </div>

        <div style="padding:30px;">
          <p style="font-size:16px;color:#333;">
            Hi <strong>${result.name}</strong>,
          </p>

          <p style="font-size:16px;color:#555;line-height:1.7;">
            Thank you for signing up! We're delighted to have you join us.
            Your account has been created successfully and you can now start exploring all the features available to you.
          </p>

          <div style="background:#f8fafc;padding:20px;border-radius:10px;margin:25px 0;">
            <h3 style="margin-top:0;color:#4F46E5;">
              Account Information
            </h3>

            <p style="margin:8px 0;">
              <strong>Name:</strong> ${result.name}
            </p>

            <p style="margin:8px 0;">
              <strong>Email:</strong> ${result.email}
            </p>
          </div>

          <p style="font-size:16px;color:#555;line-height:1.7;">
            ${result.name}, we're excited to be part of your journey and hope you have a wonderful experience with us.
          </p>

          <p style="font-size:16px;color:#555;">
            If you did not create this account, please ignore this email.
          </p>

          <br>

          <p style="margin-bottom:0;">
            Best Regards,
          </p>

          <p style="margin-top:5px;font-weight:bold;color:#4F46E5;">
            The Team
          </p>
        </div>

        <div style="background:#f3f4f6;padding:15px;text-align:center;color:#6b7280;font-size:13px;">
          This is an automated email. Please do not reply to this message.
        </div>

      </div>
    `;

        // Send Welcome Email
        await sendEmail(
            result.email,
            "🎉 Welcome! Your Account Has Been Created",
            html
        );

        return res.status(201).json({
            success: true,
            message: "Signup Successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
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

        // Check user exists
        const existingUser = await SignupModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        // Compare password
        const match = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Wrong Password",
            });
        }

        // Generate Token
        const token = jwt.sign(
            {
                id: existingUser._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "5d",
            }
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

        const existingUser = await SignupModel.findOne({
            email,
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await SignupModel.findByIdAndUpdate(
            existingUser._id,
            {
                otp,
                otpExpire:
                    new Date(Date.now() + 5 * 60 * 1000),
            }
        );

        const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Password Reset OTP</h2>

        <p>Hello ${existingUser.name},</p>

        <p>Your OTP is:</p>

        <h1 style="color:#4F46E5;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for 5 minutes.
        </p>
      </div>
    `;

        await sendEmail(
            existingUser.email,
            "Password Reset OTP",
            html
        );

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

        const existingUser =
            await SignupModel.findOne({ email });

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

        if (
            existingUser.otpExpire < Date.now()
        ) {
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
        const {
            email,
            password,
            confirmPassword,
        } = req.body;

        if (
            !email?.trim() ||
            !password?.trim() ||
            !confirmPassword?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, Password and Confirm Password are required",
            });
        }

        const existingUser =
            await SignupModel.findOne({ email });

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
                message:
                    "Password must be at least 6 characters",
            });
        }

        const isSamePassword =
            await bcrypt.compare(
                password,
                existingUser.password
            );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password cannot be the same as old password",
            });
        }

        const hash = await bcrypt.hash(
            password,
            10
        );

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
            message:
                "Password updated successfully",
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
        const {
            oldPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !oldPassword?.trim() ||
            !newPassword?.trim() ||
            !confirmPassword?.trim()
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        const match = await bcrypt.compare(
            oldPassword,
            req.user.password
        );

        if (!match) {
            return res.status(400).json({
                message: "Old password is incorrect",
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            req.user.password
        );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password cannot be same as old password",
            });
        }

        const hash = await bcrypt.hash(
            newPassword,
            10
        );

        await SignupModel.findByIdAndUpdate(
            req.user._id,
            {
                password: hash,
            }
        );

        return res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    signup,
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
};