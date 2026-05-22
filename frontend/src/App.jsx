import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ParkingSlotsPage from "./pages/ParkingSlotsPage";
import UserDashboardPage from "./pages/UserDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/parking-slots" element={<ParkingSlotsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
