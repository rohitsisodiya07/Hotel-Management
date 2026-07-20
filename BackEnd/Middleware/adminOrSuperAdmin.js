module.exports = (req, res, next) => {

    if (
        req.user.role !== "admin" &&
        req.user.role !== "superAdmin"
    ) {
        return res.status(403).json({
            success: false,
            message: "Only Admin or Super Admin can access this route",
        });
    }

    next();

};