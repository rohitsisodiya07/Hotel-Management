const jwt = require('jsonwebtoken');
const signupModel = require('../Model/signupModel');

module.exports = async (req, res, next) => {
    try {
        const authToken = req.headers.authorization;
        // console.log(">>>>>authToken", authToken);
        // console.log(">>>>>URL", req.originalUrl);
        
        

        if (!authToken) {
            return res.status(403).json({
                message: "Token missing",
            });
        }

        const token = authToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log("Decoded:", decoded);

        const userDetails = await signupModel.findById(decoded.id);
        // console.log(">>>>>userDetails", userDetails);
        

        if (!userDetails) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Token valid hone par database se aaya user data req object me save kiya
        req.user = userDetails;
        // console.log(">>>>>Before Next");
        
        next();
        // console.log(">>>>>After Next");
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: "Invalid Token",
        });
    }
};