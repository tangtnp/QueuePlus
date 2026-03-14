import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage.tsx";
import QueueBoardPage from "../pages/QueueBoardPage.tsx";
import BranchPage from "../pages/BranchPage.tsx";
import ServicePage from "../pages/ServicePage.tsx";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["staff", "admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queues"
          element={
            <ProtectedRoute allowedRoles={["staff", "admin"]}>
              <QueueBoardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BranchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ServicePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}