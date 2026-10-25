import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import UserRoutes from './2userApps/routes/UserRoutes'
import NotFoundPage from './pages/NotFoundPage'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Admin Panel Layout & Pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCctvPage from './pages/admin/AdminCctvPage'
import AdminPaymentPage from './pages/admin/AdminPaymentPage'
import AdminKasPage from './pages/admin/AdminKasPage'
import AdminComplaintPage from './pages/admin/AdminComplaintPage'
import AdminVotingPage from './pages/admin/AdminVotingPage'
import AdminAnnouncementPage from './pages/admin/AdminAnnouncementPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* User Portal Routes (Sesuai Desain & Routing Template) */}
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/dashboard/*" element={<UserRoutes />} />
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />

        {/* Admin Panel Routes (Untuk Pengurus RT/RW) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="cctv" element={<AdminCctvPage />} />
          <Route path="pembayaran" element={<AdminPaymentPage />} />
          <Route path="kas" element={<AdminKasPage />} />
          <Route path="aduan" element={<AdminComplaintPage />} />
          <Route path="voting" element={<AdminVotingPage />} />
          <Route path="pengumuman" element={<AdminAnnouncementPage />} />
          <Route path="warga" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}
