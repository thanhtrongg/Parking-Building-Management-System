import { Navigate } from "react-router-dom";

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const norm = String(role || "")
    .trim()
    .toUpperCase();
  return norm === "DRIVER" ? "USER" : norm;
}

function getRedirectPathByRole(role) {
  const normalizedRole = normalizeRole(role);

  if (["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole)) {
    return "/dashboard";
  }

  if (normalizedRole === "USER") {
    return "/user-dashboard";
  }

  return "/login";
}

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("authExpiresAt");
}

function isSessionExpired() {
  const expiresAt = Number(localStorage.getItem("authExpiresAt") || 0);
  return expiresAt > 0 && Date.now() > expiresAt;
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const user = getStoredUser();
  const userRole = normalizeRole(user?.role);

  if (token && isSessionExpired()) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    normalizeRole(role),
  );

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return <Navigate to={getRedirectPathByRole(userRole)} replace />;
  }

  return children;
}
