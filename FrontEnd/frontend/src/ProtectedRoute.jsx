import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}) => {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    user = null;
  }

  // Login nahi hai
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role wise redirect paths
  const roleRedirect = {
    superAdmin: "/superAdmin/dashboard",
    admin: "/admin/dashboard",
    hotel: "/hotel/hotelDashboard",
    user: "/",
  };

  // Agar user ka role allowed nahi hai
  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={roleRedirect[user.role] || "/"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;