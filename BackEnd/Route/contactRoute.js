const express = require("express");
const router = express.Router();
const { sendEmail } = require("../Utilities/ResendEmail");

router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required fields.",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        const supportEmail = process.env.BREVO_FROM_EMAIL || "support@aurastay.com";

        const emailHtml = `
            <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
                <div style="background: #173D31; padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0; font-size: 22px;">New AuraStay Guest Inquiry</h2>
                    <p style="margin: 4px 0 0 0; color: #c5d2c1; font-size: 13px;">Customer Support Notification</p>
                </div>
                <div style="padding: 24px 8px; color: #374151;">
                    <p style="margin: 6px 0;"><strong>Sender Name:</strong> ${name.trim()}</p>
                    <p style="margin: 6px 0;"><strong>Sender Email:</strong> <a href="mailto:${email.trim()}" style="color: #2b5443;">${email.trim()}</a></p>
                    <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject ? subject.trim() : "General Inquiry"}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
                    <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827;">Message:</p>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                        ${message.trim()}
                    </div>
                </div>
                <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                    &copy; ${new Date().getFullYear()} AuraStay Concierge Support System.
                </p>
            </div>
        `;

        // Send notification email asynchronously
        sendEmail(supportEmail, `📩 AuraStay Inquiry: ${subject || "Guest Support"} from ${name}`, emailHtml)
            .catch((err) => console.error("Contact send error:", err.message));

        return res.status(200).json({
            success: true,
            message: "Thank you for reaching out! Your message has been sent to our concierge team. We will respond within 24 hours.",
        });
    } catch (error) {
        console.error("Contact API error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit your message. Please try again later.",
        });
    }
});

module.exports = router;
