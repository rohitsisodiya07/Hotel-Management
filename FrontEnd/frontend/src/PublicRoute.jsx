import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    return token ? <Navigate to="/user" /> : children;
};

export default PublicRoute;