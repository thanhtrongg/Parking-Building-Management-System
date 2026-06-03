import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminVehiclesPage from "./pages/AdminVehiclesPage";
import ParkingSlotsPage from "./pages/ParkingSlotsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PricingPoliciesPage from "./pages/PricingPoliciesPage";
import PublicLandingPage from "./pages/PublicLandingPage";
import ReservationsPage from "./pages/ReservationsPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserMyBookingsPage from "./pages/UserMyBookingsPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import ZonesPage from "./pages/ZonesPage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const systemRoles = ["ADMIN", "MANAGER", "STAFF"];
  const managementRoles = ["ADMIN", "MANAGER"];
  const adminOnlyRoles = ["ADMIN"];
  const userRoles = ["USER"];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/login" element={<LoginPage />} />

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
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={systemRoles}>
              <ReservationsPage />
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
