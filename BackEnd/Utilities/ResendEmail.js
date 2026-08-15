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
            console.log("Email Error:", error);
            return;
        }

        console.log("Email Sent Successfully");
        console.log(data);
    } catch (error) {
        console.log("Email Error:", error);
    }
};

module.exports = sendEmail;