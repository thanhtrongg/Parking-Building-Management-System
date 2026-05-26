import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (
      user.role === "SYSTEM_ADMIN" ||
      user.role === "FACILITY_MANAGER" ||
      user.role === "PARKING_STAFF"
    ) {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "DRIVER") {
      return <Navigate to="/user-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
