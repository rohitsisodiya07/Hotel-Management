module.exports = (req, res, next) => {
    if (!req.user || !["admin", "hotel"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Only Admin or Hotel can access this route",
        });
    }

    next();
};