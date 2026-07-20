import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  allowedRoles,
}) => {
  const token =
    localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  if (!token) {
    return (
      <Navigate to="/login" />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      currentUser?.role
    )
  ) {
    return (
      <Navigate to="/login" replace />
    );
  }

  return children;
};

export default ProtectedRoute;