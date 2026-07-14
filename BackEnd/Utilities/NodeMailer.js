const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            html, 
        });

        console.log("Email Sent Successfully");
        console.log(info.response);
    } catch (error) {
        console.log("Email Error:", error);
    }
};

module.exports = sendEmail;
