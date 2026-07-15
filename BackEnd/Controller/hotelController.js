const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");
const bcrypt = require("bcrypt");
const sendEmail = require("../Utilities/NodeMailer");

// ================= EMAIL TEMPLATES =================
// Table-based, inline-styled markup so it renders consistently across
// Gmail, Outlook, Apple Mail, etc. (modern CSS like flexbox/grid is
// unreliable in email clients, so we avoid it here on purpose.)

const emailShell = ({ preheader, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hotel Management</title>
  </head>
  <body style="margin:0; padding:0; background-color:#ECE9DF; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ECE9DF; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#FFFEFB; border-radius:16px; overflow:hidden; border:1px solid #E3E0D4;">

            <!-- Header -->
            <tr>
              <td style="background-color:#201F19; padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px; height:36px; background-color:#F3EFE3; border-radius:8px; text-align:center; vertical-align:middle; font-family:'Courier New', monospace; font-size:14px; font-weight:bold; color:#201F19;">
                      H
                    </td>
                    <td style="padding-left:12px; font-size:15px; font-weight:600; color:#F3EFE3; letter-spacing:0.02em;">
                      Hotel Management
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 32px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #EFEBDF;">
                <p style="margin:0; font-size:12px; color:#A39B8B; line-height:1.6;">
                  This is an automated message from Hotel Management. Please don't reply directly to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const approvalEmail = ({ ownerName, hotelName, email, password, loginUrl }) =>
    emailShell({
        preheader: `Your registration for ${hotelName} has been approved.`,
        bodyHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#EAF3EC; border-radius:20px; padding:6px 14px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#3E6E4A;">
            REQUEST APPROVED
          </td>
        </tr>
      </table>

      <h1 style="margin:0 0 12px; font-size:21px; font-weight:600; color:#201F19;">
        Hello ${ownerName},
      </h1>

      <p style="margin:0 0 20px; font-size:14px; line-height:1.65; color:#5A554C;">
        Good news — your registration request for <strong style="color:#201F19;">${hotelName}</strong> has been reviewed and approved. You can now log in and start managing your property.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F2; border:1px solid #EFEBDF; border-radius:12px; margin-bottom:24px;">
        <tr>
          <td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px; letter-spacing:0.08em; color:#9A927D; padding-bottom:4px; font-family:'Courier New', monospace;">EMAIL</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#201F19; padding-bottom:14px;">${email}</td>
              </tr>
              <tr>
                <td style="font-size:11px; letter-spacing:0.08em; color:#9A927D; padding-bottom:4px; font-family:'Courier New', monospace;">TEMPORARY PASSWORD</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#201F19; font-family:'Courier New', monospace;">${password}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px; font-size:13px; line-height:1.6; color:#8B8474;">
        For security, we recommend changing this password after your first login.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background-color:#201F19; border-radius:8px;">
            <a href="${loginUrl}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:600; color:#F3EFE3; text-decoration:none;">
              Log in to your account
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:28px 0 0; font-size:13px; line-height:1.6; color:#8B8474;">
        Regards,<br />Hotel Management Team
      </p>
    `,
    });

const rejectionEmail = ({ ownerName, hotelName, remark }) =>
    emailShell({
        preheader: `An update on your registration for ${hotelName}.`,
        bodyHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#FBECEA; border-radius:20px; padding:6px 14px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#B04A3C;">
            REQUEST NOT APPROVED
          </td>
        </tr>
      </table>

      <h1 style="margin:0 0 12px; font-size:21px; font-weight:600; color:#201F19;">
        Hello ${ownerName},
      </h1>

      <p style="margin:0 0 20px; font-size:14px; line-height:1.65; color:#5A554C;">
        Thank you for registering <strong style="color:#201F19;">${hotelName}</strong> with us. After review, we're unable to approve this request at the moment.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FBECEA; border-radius:12px; margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:11px; letter-spacing:0.08em; color:#B04A3C; font-family:'Courier New', monospace;">REASON</p>
            <p style="margin:0; font-size:14px; color:#8A392F; line-height:1.6;">${remark}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0; font-size:14px; line-height:1.65; color:#5A554C;">
        You're welcome to update your details and submit a new request whenever you're ready.
      </p>

      <p style="margin:28px 0 0; font-size:13px; line-height:1.6; color:#8B8474;">
        Regards,<br />Hotel Management Team
      </p>
    `,
    });

const createHotel = async (req, res) => {
    try {
        const { hotelName, ownerName, email, mobile, city, address, totalRooms } = req.body;

        // Validations
        if (!hotelName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Hotel name is required",
            });
        }

        if (!ownerName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Owner name is required",
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            });
        }

        if (!mobile?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must be 10 digits",
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

        if (!totalRooms || totalRooms <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total rooms must be greater than 0",
            });
        }

        const existingHotel = await hotelModel.findOne({ email });

        if (existingHotel) {
            return res.status(400).json({
                success: false,
                message: "Hotel with this email already exists",
            });
        }

        // Upload Images
        let hotelImage = "";
        let ownerImage = "";

        if (req.files?.hotelImage) {
            const result = await uploadImage({ hotelImage: req.files.hotelImage });

            hotelImage = result[0]?.secure_url || "";
        }

        if (req.files?.ownerImage) {
            const result = await uploadImage({ ownerImage: req.files.ownerImage });

            ownerImage = result[0]?.secure_url || "";
        }

        // Create Hotel
        const data = { ...req.body, hotelImage, ownerImage };

        const hotel = await hotelModel.create(data);

        // Populate
        const populatedHotel = await hotelModel.findById(hotel._id).populate({
            path: "city",
            populate: {
                path: "districtId",
                populate: {
                    path: "stateId",
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Request sent successfully. Wait for approval.",
            hotel: populatedHotel,
        });
    } catch (error) {
        console.log("Create Hotel Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPendingHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ status: "Pending" }).populate({
            path: "city",
            populate: {
                path: "districtId",
                populate: {
                    path: "stateId",
                },
            },
        });

        res.status(200).json({
            success: true,
            hotels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const approveHotel = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const hotel = await hotelModel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
        }

        if (hotel.status === "Approved") {
            return res.status(400).json({
                success: false,
                message: "Hotel is already approved",
            });
        }

        const hashPassword = bcrypt.hashSync(password, 10);

        hotel.password = hashPassword;
        hotel.status = "Approved";
        hotel.remark = "";

        await hotel.save();

        await sendEmail(
            hotel.email,
            "Your hotel registration has been approved",
            approvalEmail({
                ownerName: hotel.ownerName,
                hotelName: hotel.hotelName,
                email: hotel.email,
                password,
                loginUrl: process.env.CLIENT_LOGIN_URL || "#",
            })
        );

        res.status(200).json({
            success: true,
            message: "Hotel approved successfully",
            hotel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const rejectHotel = async (req, res) => {
    try {
        const { remark } = req.body;

        if (!remark?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Remark is required",
            });
        }

        const hotel = await hotelModel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
        }

        if (hotel.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message: "Hotel is already rejected",
            });
        }

        hotel.status = "Rejected";
        hotel.remark = remark;
        hotel.password = "";

        await hotel.save();

        await sendEmail(
            hotel.email,
            "An update on your hotel registration",
            rejectionEmail({
                ownerName: hotel.ownerName,
                hotelName: hotel.hotelName,
                remark,
            })
        );

        res.status(200).json({
            success: true,
            message: "Hotel rejected successfully",
            hotel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getRejectedHotels = async (req, res) => {
    try {
        const hotels = await hotelModel.find({ status: "Rejected" }).populate({
            path: "city",
            populate: {
                path: "districtId",
                populate: {
                    path: "stateId",
                },
            },
        });

        res.status(200).json({
            success: true,
            hotels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createHotel,
    getPendingHotels,
    approveHotel,
    rejectHotel,
    getRejectedHotels,
};