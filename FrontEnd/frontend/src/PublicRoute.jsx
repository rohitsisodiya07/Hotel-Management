    import React from "react";
    import { Navigate } from "react-router-dom";

    const PublicRoute = ({ children }) => {
        const token = localStorage.getItem("token");

        let currentUser = null;

        try {
            const storedUser = localStorage.getItem("user");
            currentUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            localStorage.removeItem("user");
            currentUser = null;
        }

        // Login nahi hai
        if (!token) {
            return children;
        }

        // Token hai lekin user missing hai
        if (!currentUser) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return children;
        }

        const roleRedirect = {
            superAdmin: "/superAdmin/dashboard",
            admin: "/admin/dashboard",
            hotel: "/hotel/hotelDashboard",
            user: "/",
        };

        return (
            <Navigate
                to={roleRedirect[currentUser.role] || "/"}
                replace
            />
        );
    };

    export default PublicRoute;