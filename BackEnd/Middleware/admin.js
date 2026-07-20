module.exports = (req, res, next) => {
    // Ye check karega ki req.user logged-in hai aur uska role exact admin hai ya nahi
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Only Admin can access this route",
        });
    }

    next();
};