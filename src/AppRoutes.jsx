import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import UserRoutes from "./2userApps/routes/UserRoutes";
import AdminRoutes from "./1adminApps/routes/AdminRoutes";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* User Portal Routes */}
      <Route path="/user/*" element={<UserRoutes />} />
      <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
      <Route path="/dashboard/*" element={<UserRoutes />} />

      {/* Admin Portal Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
