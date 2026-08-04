import React from "react";
import { Navigate } from "react-router-dom";
import PublicHome from "./User/PublicHome";

const HomeRedirect = () => {
    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return <PublicHome />;
    }

    // Login nahi hai
    if (!token || !user) {
        return <PublicHome />;
    }

    // Role wise redirect
    switch (user.role) {
        case "superAdmin":
            return <Navigate to="/superAdmin/state" replace />;

        case "admin":
            return <Navigate to="/admin/dashboard" replace />;

        case "hotel":
            return <Navigate to="/hotel/hotelDashboard" replace />;

        case "user":
            return <PublicHome />;

        default:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return <PublicHome />;
    }
};

export default HomeRedirect;