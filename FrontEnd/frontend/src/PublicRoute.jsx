import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    let currentUser = null;

    try {
        currentUser = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
        localStorage.removeItem("user");
    }

    if (!token) {
        return children;
    }

    switch (currentUser?.role) {
        case "superAdmin":
            return <Navigate to="/superAdmin/state" replace />;

        case "admin":
            return <Navigate to="/admin/dashboard" replace />;

        case "hotel":
            return <Navigate to="/hotel/hotelDashboard" replace />;

        case "user":
            return <Navigate to="/" replace />;

        default:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return children;
    }
};

export default PublicRoute;