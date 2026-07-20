const adminModel = require('../Model/adminModel');
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const signupModel = require('../Model/signupModel');
const sendEmail = require("../Utilities/NodeMailer");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../Utilities/Cloudinary");


//Create Admin

const createAdminRequest = async (req, res) => {
    try {
        let { name, email, mobile } = req.body;

        // Required Fields
        if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Profile Image Required
        if (!req.files?.profileImage) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required",
            });
        }

        name = name.trim();
        email = email.trim().toLowerCase();
        mobile = mobile.trim();

        // Name Validation
        if (!/^[A-Za-z\s.]+$/.test(name)) {
            return res.status(400).json({
                success: false,
                message: "Invalid name",
            });
        }

        // Email Validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Mobile Validation
        const mobileRegex = /^[6-9][0-9]{9}$/;

        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number",
            });
        }

        const profileImage = req.files.profileImage;

        // Image Type Validation
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(profileImage.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, JPEG, PNG and WEBP images are allowed",
            });
        }

        // Image Size Validation (2 MB)
        if (profileImage.size > 2 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: "Image size should not exceed 2 MB",
            });
        }

        // Check Existing Request
        const existingRequest = await adminModel.findOne({ email });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Request already submitted",
            });
        }

        // Check Existing Admin
        const existingUser = await signupModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists",
            });
        }

        // Upload Image
        const uploadedImage = await uploadImage(profileImage);

        const profileImageUrl = uploadedImage[0].secure_url;

        // Generate Tracking ID
        const trackingId = uuidv4();

        // Save Request
        const admin = await adminModel.create({
            name,
            email,
            mobile,
            profileImage: profileImageUrl,
            trackingId,
        });

        // Send Email
        await sendEmail(
            email,
            "Admin Request Submitted",
            `Hello ${name},

Your admin registration request has been submitted successfully.

Tracking ID:
${trackingId}

Please save this Tracking ID carefully.
You can use it to check your request status and edit your request while it is pending.

Thank You,
Hotel Management Team`
        );

        return res.status(201).json({
            success: true,
            message:
                "Request submitted successfully. Tracking ID has been sent to your email.",
            admin,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Get Pending Req
const getPendingAdminRequests = async (req, res) => {
    try {
        const admins =
            await adminModel
                .find({
                    status: "Pending",
                })
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,
            count: admins.length,
            admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


const approveAdminRequest = async (req, res) => {
    const session =
        await mongoose.startSession();

    try {
        const { password } =
            req.body;

        if (
            !password?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password is required",
            });
        }

        if (
            password.trim()
                .length < 6
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters",
            });
        }

        session.startTransaction();

        const admin =
            await adminModel
                .findById(
                    req.params.id
                )
                .session(
                    session
                );

        if (!admin) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "Request not found",
            });
        }

        if (
            admin.status ===
            "Approved"
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "Admin already approved",
            });
        }

        if (
            admin.status ===
            "Rejected"
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "Rejected request cannot be approved",
            });
        }

        const existingUser =
            await signupModel
                .findOne({
                    email:
                        admin.email,
                })
                .session(
                    session
                );

        if (
            existingUser
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "User already exists",
            });
        }

        const hashPassword =
            await bcrypt.hash(
                password,
                10
            );

        await signupModel.create(
            [
                {
                    name:
                        admin.name,
                    email:
                        admin.email,
                    password:
                        hashPassword,
                    role:
                        "admin",
                },
            ],
            {
                session,
            }
        );

        admin.status =
            "Approved";

        admin.remark = "";

        await admin.save({
            session,
        });

        await session.commitTransaction();

        await sendEmail(
            admin.email,
            "Admin Account Approved",
            `
Hello ${admin.name},

Your admin account has been approved.

Email:
${admin.email}

Password:
${password}

You can now login.

Thank You
Hotel Management Team
`
        );

        res.status(200).json({
            success: true,
            message:
                "Admin approved successfully",
        });
    } catch (error) {
        if (
            session.inTransaction()
        ) {
            await session.abortTransaction();
        }

        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    } finally {
        session.endSession();
    }
};


const rejectAdminRequest = async (req, res) => {
    try {
        const { remark } =
            req.body;

        if (
            !remark?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Remark is required",
            });
        }

        const admin =
            await adminModel.findById(
                req.params.id
            );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found",
            });
        }

        if (
            admin.status ===
            "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request already rejected",
            });
        }

        if (
            admin.status ===
            "Approved"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Approved request cannot be rejected",
            });
        }

        admin.status =
            "Rejected";

        admin.remark =
            remark.trim();

        await admin.save();

        await sendEmail(
            admin.email,
            "Admin Request Rejected",
            `
Hello ${admin.name},

Your admin request has been rejected.

    Reason:
${admin.remark}

You can submit a new request after resolving the issue.

Thank You
Hotel Management Team
    `
        );

        res.status(200).json({
            success: true,
            message:
                "Request rejected successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


const sendOtp = async (req, res) => {
    try {
        const { trackingId } =
            req.body;

        if (
            !trackingId?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tracking ID is required",
            });
        }

        const admin =
            await adminModel.findOne({
                trackingId:
                    trackingId.trim(),
            });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Invalid Tracking ID",
            });
        }

        if (
            admin.status ===
            "Approved"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request already approved",
            });
        }

        if (
            admin.status ===
            "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request already rejected",
            });
        }

        // Existing OTP still valid
        if (
            admin.otp &&
            admin.otpExpire &&
            admin.otpExpire >
            Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP already sent. Please check your email.",
            });
        }

        const otp =
            Math.floor(
                100000 +
                Math.random() *
                900000
            ).toString();

        admin.otp = otp;

        admin.otpExpire =
            Date.now() +
            2 *
            60 *
            1000;

        await admin.save();

        await sendEmail(
            admin.email,
            "OTP Verification",
            `
Hello ${admin.name},

Your OTP is:

${otp}

This OTP is valid for 2 minutes.

Thank You
Hotel Management Team
`
        );

        res.status(200).json({
            success: true,
            message:
                "OTP sent successfully",
            email:
                admin.email,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const {
            trackingId,
            otp,
        } = req.body;

        if (
            !trackingId?.trim() ||
            !otp?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tracking ID and OTP are required",
            });
        }

        const admin =
            await adminModel.findOne({
                trackingId:
                    trackingId.trim(),
            });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Invalid Tracking ID",
            });
        }

        if (
            admin.status ===
            "Approved"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request already approved",
            });
        }

        if (
            admin.status ===
            "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Request already rejected",
            });
        }

        if (
            !admin.otp ||
            !admin.otpExpire
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please request a new OTP",
            });
        }

        if (
            admin.otpExpire <
            Date.now()
        ) {
            admin.otp = "";
            admin.otpExpire =
                null;

            await admin.save();

            return res.status(400).json({
                success: false,
                message:
                    "OTP expired",
            });
        }

        if (
            admin.otp !==
            otp.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP",
            });
        }

        admin.otp = "";
        admin.otpExpire =
            null;

        await admin.save();

        res.status(200).json({
            success: true,
            admin: {
                _id:
                    admin._id,
                name:
                    admin.name,
                email:
                    admin.email,
                mobile:
                    admin.mobile,
                profileImage:
                    admin.profileImage,
                status:
                    admin.status,
                trackingId:
                    admin.trackingId,
                remark:
                    admin.remark,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};



const getAdminById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid request id",
            });
        }

        const admin =
            await adminModel.findById(
                id
            );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found",
            });
        }

        res.status(200).json({
            success: true,
            admin: {
                _id:
                    admin._id,
                name:
                    admin.name,
                email:
                    admin.email,
                mobile:
                    admin.mobile,
                profileImage:
                    admin.profileImage,
                status:
                    admin.status,
                trackingId:
                    admin.trackingId,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

const updateRequest = async (req,
    res
) => {
    try {
        const { id } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid request id",
            });
        }

        const admin =
            await adminModel.findById(
                id
            );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found",
            });
        }

        if (
            admin.status !==
            "Pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending requests can be updated",
            });
        }

        let {
            name,
            email,
            mobile,
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !mobile?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required",
            });
        }

        name = name.trim();
        email = email
            .trim()
            .toLowerCase();
        mobile =
            mobile.trim();

        if (
            !/^[A-Za-z\s.]+$/.test(
                name
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid name",
            });
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid email address",
            });
        }

        if (
            !/^[6-9]\d{9}$/.test(
                mobile
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid mobile number",
            });
        }

        if (
            email !==
            admin.email
        ) {
            const existing =
                await adminModel.findOne(
                    {
                        email,
                    }
                );

            if (
                existing
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email already exists",
                });
            }

            const existingUser =
                await signupModel.findOne(
                    {
                        email,
                    }
                );

            if (
                existingUser
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Admin already exists",
                });
            }
        }

        admin.name = name;
        admin.email =
            email;
        admin.mobile =
            mobile;

        if (
            req.files
                ?.profileImage
        ) {
            admin.profileImage =
                (
                    await uploadImage({
                        profileImage:
                            req.files
                                .profileImage,
                    })
                )[0]
                    .secure_url;
        }

        await admin.save();

        res.status(200).json({
            success: true,
            message:
                "Request updated successfully",
            admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

const getRejectedAdminRequests = async (req, res) => {
    try {
        const admins =
            await adminModel.find({
                status: "Rejected",
            });

        res.status(200).json({
            admins,
        });
    } catch (error) {
        res.status(500).json({
            message:
                error.message,
        });
    }
};


module.exports = {
    createAdminRequest,
    getPendingAdminRequests,
    approveAdminRequest,
    rejectAdminRequest,
    sendOtp,
    verifyOtp,
    getAdminById,
    updateRequest,
    getRejectedAdminRequests
};