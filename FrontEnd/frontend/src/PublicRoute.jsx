import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!token) {
        return children;
    }

    switch (currentUser?.role) {
        case "superAdmin":
            return <Navigate to="/superAdmin/state" replace />;

        case "admin":
            return <Navigate to="/admin/dashboard" replace />;

        case "user":
            return <Navigate to="/user" replace />;

        default:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return children;
    }
};

export default PublicRoute;