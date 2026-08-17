require("dotenv").config();

const sendEmail = async (to, subject, html) => {
    console.log("email coll");
    
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    email: process.env.BREVO_FROM_EMAIL,
                    name: "AuraStay",
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();

            console.log("Brevo Error:", errorData);

            throw new Error(
                errorData.message || "Failed to send email via Brevo API"
            );
        }

        const data = await response.json();

        console.log("Email sent successfully:", data);

        return data;
    } catch (err) {
        console.log("Email Error:", err.message);
        throw err;
    }
};

module.exports = { sendEmail };