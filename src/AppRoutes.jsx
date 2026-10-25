import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import UserRoutes from "./2userApps/routes/UserRoutes";
import AdminRoutes from "./1adminApps/routes/AdminRoutes";
import LoginPage from "./pages/LoginPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes/>}/>
    </Routes>
  );
}

export default AppRoutes;
