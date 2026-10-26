import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayouts";
import AdminDashboard from "../pages/AdminDashboard";
import AdminPaymentPage from "../../pages/admin/AdminPaymentPage";
import AdminKasPage from "../../pages/admin/AdminKasPage";
import AdminComplaintPage from "../../pages/admin/AdminComplaintPage";
import AdminCctvPage from "../../pages/admin/AdminCctvPage";
import AdminVotingPage from "../../pages/admin/AdminVotingPage";
import AdminAnnouncementPage from "../../pages/admin/AdminAnnouncementPage";
import AdminUsersPage from "../../pages/admin/AdminUsersPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Iuran & Pembayaran */}
        <Route path="iuran" element={<AdminPaymentPage />} />
        <Route path="pembayaran" element={<AdminPaymentPage />} />

        {/* Buku Kas Lingkungan */}
        <Route path="kas" element={<AdminKasPage />} />

        {/* Aduan & Permohonan */}
        <Route path="aduan" element={<AdminComplaintPage />} />
        <Route path="complaint" element={<AdminComplaintPage />} />

        {/* Keamanan & CCTV */}
        <Route path="keamanan" element={<AdminCctvPage />} />
        <Route path="cctv" element={<AdminCctvPage />} />

        {/* Aspirasi & Musyawarah Voting */}
        <Route path="aspirasi" element={<AdminVotingPage />} />
        <Route path="voting" element={<AdminVotingPage />} />

        {/* Pengumuman Resmi */}
        <Route path="pengumuman" element={<AdminAnnouncementPage />} />

        {/* Direktori Warga (KK) & Profil */}
        <Route path="profil" element={<AdminUsersPage />} />
        <Route path="warga" element={<AdminUsersPage />} />
        <Route path="users" element={<AdminUsersPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
