const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"AuraStay" <${process.env.BREVO_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email Sent Successfully");
        console.log("Message ID:", info.messageId);

        return {
            success: true,
            data: info,
        };
    } catch (error) {
        console.log("❌ Email Error:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = sendEmail;