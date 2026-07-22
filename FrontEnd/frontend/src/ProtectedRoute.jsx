import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Login nahi hai
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Agar role allow nahi hai
  if (!allowedRoles.includes(user.role)) {

    switch (user.role) {
      case "superAdmin":
        return <Navigate to="/superAdmin/state" replace />;

      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      case "hotel":
        return <Navigate to="/hotel" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;