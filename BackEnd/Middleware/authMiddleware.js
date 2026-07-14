const jwt = require('jsonwebtoken');
const signupModel = require('../Model/signupModel');

module.exports = async (req, res, next) => {
    try {
        const authToken = req.headers.authorization;

        if (!authToken) {
            return res.status(403).json({
                message: "Token missing",
            });
        }

        const token = authToken.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded:", decoded);

        const userDetails = await signupModel.findById(decoded.id);

        if (!userDetails) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.user = userDetails;

        next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: "Invalid Token",
        });
    }
};