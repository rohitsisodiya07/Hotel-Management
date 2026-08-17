const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "AuraStay <onboarding@resend.dev>",
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.log("❌ Resend Error:", error);
            throw new Error(error.message);
        }

        console.log("✅ Email Sent Successfully:", data);

        return {
            success: true,
            data
        };

    } catch (error) {
        console.log("❌ Email Error:", error);

        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = sendEmail;