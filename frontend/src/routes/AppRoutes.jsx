import { BrowserRouter, Routes, Route } from "react-router-dom";
import ParkingSlotsPage from "../pages/system/ParkingSlotsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ParkingSlotsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
