import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
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
    return (
      <Navigate to="/login" />
    );
  }

  // Agar Super Admin hai to user page par mat jane do
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

  return children;
};

export default ProtectedRoute;