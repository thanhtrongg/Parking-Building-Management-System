import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import PublicLandingPage from "./pages/public/LandingPage";
import DashboardPage from "./pages/system/DashboardPage";
import ParkingSessionsPage from "./pages/system/ParkingSessionsPage";
import WalkInParkingPage from "./pages/system/WalkInParkingPage";
import ParkingSlotsPage from "./pages/system/ParkingSlotsPage";
import PaymentsPage from "./pages/system/PaymentsPage";
import PricingPoliciesPage from "./pages/system/PricingPoliciesPage";
import ReservationsPage from "./pages/system/ReservationsPage";
import QrCheckInPage from "./pages/system/QrCheckInPage";
import FeedbacksPage from "./pages/system/FeedbacksPage";
import AdminUsersPage from "./pages/system/UsersPage";
import AdminVehiclesPage from "./pages/system/VehiclesPage";
import ZonesPage from "./pages/system/ZonesPage";
import UserDashboardPage from "./pages/user/DashboardPage";
import UserBookingHistoryPage from "./pages/user/BookingHistoryPage";
import UserFeedbackPage from "./pages/user/FeedbackPage";
import UserMyBookingsPage from "./pages/user/MyBookingsPage";
import UserParkingSessionsPage from "./pages/user/ParkingSessionsPage";
import UserSettingsPage from "./pages/user/SettingsPage";

import ProtectedRoute from "./routes/ProtectedRoute";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase();
}

function getHomePathByRole(role) {
  const normalizedRole = normalizeRole(role);

  if (["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole)) {
    return "/dashboard";
  }

  if (normalizedRole === "USER") {
    return "/user-dashboard";
  }

  return "/login";
}

function PublicRoute({ children }) {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  const user = getStoredUser();
  const role = normalizeRole(user?.role || localStorage.getItem("role"));

  if (token && isSessionExpired()) {
    clearSession();
  } else if (token && role) {
    return <Navigate to={getHomePathByRole(role)} replace />;
  }

  return children;
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

function shouldUseInactivityTimeout() {
  return localStorage.getItem("rememberMe") !== "true";
}

function hasActiveSession() {
  if (isSessionExpired()) {
    clearSession();
    return false;
  }

  return Boolean(
    localStorage.getItem("accessToken") || localStorage.getItem("token"),
  );
}

function InactivityTimeout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hasActiveSession()) return undefined;
    if (!shouldUseInactivityTimeout()) return undefined;

    let timeoutId;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        clearSession();
        navigate("/", { replace: true });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
      "wheel",
    ];

    resetTimer();
    events.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  const systemRoles = ["ADMIN", "MANAGER", "STAFF"];
  const managementRoles = ["ADMIN", "MANAGER"];
  const adminOnlyRoles = ["ADMIN"];
  const userRoles = ["USER"];

  return (
    <BrowserRouter>
      <InactivityTimeout />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <PublicLandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />

        {/* ADMIN / MANAGER / STAFF routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parking-slots"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <ParkingSlotsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parking-sessions"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <ParkingSessionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parking-sessions/create"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <WalkInParkingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr-check-in"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <QrCheckInPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pricing-policies"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <PricingPoliciesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedbacks"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <FeedbacksPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN / MANAGER only routes */}
        <Route
          path="/admin-zones"
          element={
            <ProtectedRoute allowedRoles={managementRoles}>
              <ZonesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-vehicles"
          element={
            <ProtectedRoute allowedRoles={managementRoles}>
              <AdminVehiclesPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN only routes */}
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRoles={adminOnlyRoles}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* USER routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-bookings"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserMyBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-booking-history"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserBookingHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-parking-sessions"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserParkingSessionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-feedback"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserFeedbackPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-settings"
          element={
            <ProtectedRoute allowedRoles={userRoles}>
              <UserSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
