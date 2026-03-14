import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}