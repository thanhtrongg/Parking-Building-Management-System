import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminVehiclesPage from "./pages/AdminVehiclesPage";
import ParkingSlotsPage from "./pages/ParkingSlotsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PublicLandingPage from "./pages/PublicLandingPage";
import ReservationsPage from "./pages/ReservationsPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserMyBookingsPage from "./pages/UserMyBookingsPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const adminRoles = ["SYSTEM_ADMIN", "FACILITY_MANAGER", "PARKING_STAFF"];
  const userRoles = ["DRIVER"];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={adminRoles}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRoles={adminRoles}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-vehicles" element={<AdminVehiclesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
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
        <Route
          path="/parking-slots"
          element={
            <ProtectedRoute allowedRoles={adminRoles}>
              <ParkingSlotsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
