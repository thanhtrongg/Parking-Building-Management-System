import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ParkingSlotsPage from "./pages/ParkingSlotsPage";
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
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/user-bookings" element={<UserMyBookingsPage />} />
        <Route path="/user-settings" element={<UserSettingsPage />} />
        <Route path="/parking-slots" element={<ParkingSlotsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
