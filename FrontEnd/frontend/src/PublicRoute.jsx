import { Navigate } from "react-router-dom";

const PublicRoute = ({
    children,
}) => {
    const token =
        localStorage.getItem("token");

    const currentUser = JSON.parse(
        localStorage.getItem(
            "user"
        )
    );

    if (!token) {
        return children;
    }

    if (
        currentUser?.role ===
        "superAdmin"
    ) {
        return (
            <Navigate
                to="/superAdmin/state"
                replace
            />
        );
    }

    return (
        <Navigate
            to="/user"
            replace
        />
    );
};

export default PublicRoute;