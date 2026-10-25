import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayouts";
import UserDashboard from "../pages/DashboardPage";
import IuranKeuangan from "../pages/IuranKeuanganPage";
import AduanPermohonan from "../pages/AduanPermohonan";
import KeamananPage from "../pages/KeamananPage";
import AspirasiPartisipasi from "../pages/AspirasiPartisipasi";
import ProfilPage from "../pages/ProfilPage";

function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="iuran" element={<IuranKeuangan />} />
        <Route path="/iuran" element={<IuranKeuangan />} />
        <Route path="aduan" element={<AduanPermohonan />} /> 
        <Route path="/aduan" element={<AduanPermohonan />} /> 
        <Route path="keamanan" element={<KeamananPage />} />
        <Route path="/keamanan" element={<KeamananPage />} />
        <Route path="aspirasi" element={<AspirasiPartisipasi />} /> 
        <Route path="/aspirasi" element={<AspirasiPartisipasi />} /> 
        <Route path="profil" element={<ProfilPage />} />
        <Route path="/profil" element={<ProfilPage />} />
      </Route>
    </Routes>
  );
}

export default UserRoutes;
