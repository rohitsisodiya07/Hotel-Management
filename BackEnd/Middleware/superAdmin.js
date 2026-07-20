module.exports = (req, res, next) => {

    if (req.user.role !== "superAdmin") {
        return res.status(403).json({
            success: false,
            message: "Only Super Admin can access this route",
        });
    }

    next();

};