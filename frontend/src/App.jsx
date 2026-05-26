import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminVehiclesPage from "./pages/AdminVehiclesPage";
import ParkingSlotsPage from "./pages/ParkingSlotsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReservationsPage from "./pages/ReservationsPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserMyBookingsPage from "./pages/UserMyBookingsPage";
import UserSettingsPage from "./pages/UserSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin-vehicles" element={<AdminVehiclesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/user-bookings" element={<UserMyBookingsPage />} />
        <Route path="/user-settings" element={<UserSettingsPage />} />
        <Route path="/parking-slots" element={<ParkingSlotsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
