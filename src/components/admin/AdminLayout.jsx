import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  CreditCard,
  Receipt,
  MessageSquareWarning,
  Vote,
  Bell,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { confirmAction, toastSuccess } from '../../lib/alerts'
import Logo from '../ui/Logo'
import Avatar from '../ui/Avatar'

const adminNav = [
  { name: 'Ringkasan Admin', to: '/admin', end: true, icon: LayoutDashboard },
  { name: 'Kamera CCTV & Kontak', to: '/admin/cctv', icon: Camera },
  { name: 'Verifikasi Pembayaran', to: '/admin/pembayaran', icon: CreditCard },
  { name: 'Buku Kas Lingkungan', to: '/admin/kas', icon: Receipt },
  { name: 'Aduan & Permohonan', to: '/admin/aduan', icon: MessageSquareWarning },
  { name: 'Musyawarah & Voting', to: '/admin/voting', icon: Vote },
  { name: 'Pengumuman Resmi', to: '/admin/pengumuman', icon: Bell },
  { name: 'Direktori Warga (KK)', to: '/admin/warga', icon: Users },
]

export default function AdminLayout() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const isAdmin = user?.role === 'admin'

  const handleSwitchToAdmin = async () => {
    setSwitching(true)
    try {
      await login('admin@siaga.id', 'password123')
      toastSuccess('Berhasil beralih ke Administrator RT/RW!')
      window.location.reload()
    } catch (e) {
      console.error(e)
    } finally {
      setSwitching(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Keluar dari Sesi Admin?',
      text: 'Anda akan keluar dari panel pengurus SIAGA.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      danger: true,
    })
    if (confirmed) {
      await logout()
      toastSuccess('Berhasil keluar')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#1B292D] font-sans text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#26383D] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Logo light />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4B740] text-[#26383D]">
            ADMIN
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/15"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#1B292D]/95 backdrop-blur-lg flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Logo light />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4B740] text-[#26383D]">
                PANEL ADMIN
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[#26383D] border border-white/10">
            <Link
              to="/user/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-[#3CC4B0] flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Buka Ruang Warga
            </Link>
          </div>

          <nav className="mt-6 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive =
                item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#F4B740] text-[#26383D] font-bold shadow-md'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 text-rose-300 text-xs font-bold border border-rose-500/30 hover:bg-rose-600/30"
            >
              <LogOut className="h-4 w-4" /> Keluar Sesi Admin
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-[#26383D] border-r border-white/10 h-screen overflow-y-auto text-slate-100 p-5 sticky top-0">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <Logo light />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4B740] text-[#26383D] font-mono">
            RT/RW ADMIN
          </span>
        </div>

        {/* Switcher Pill to User Dashboard */}
        <div className="mt-4">
          <Link
            to="/user/dashboard"
            className="group flex items-center justify-between px-3 py-2 rounded-xl bg-[#1B292D] border border-white/10 hover:border-[#3CC4B0]/50 transition text-xs font-medium text-[#3CC4B0]"
            title="Pindah ke Dashboard Warga"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 text-[#3CC4B0] group-hover:-translate-x-0.5 transition" />
              <span>Lihat Tampilan Warga</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>

        {/* Navigation items */}
        <div className="mt-5 text-[11px] font-bold text-slate-300 tracking-wider uppercase px-2">
          Menu Pengurus
        </div>
        <nav className="mt-2 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon
            const isActive =
              item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-[#F4B740] text-[#26383D] font-bold shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 text-[#3CC4B0]" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Admin Profile & Logout Box */}
        <div className="mt-auto pt-5 border-t border-white/10">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <Avatar name={user?.name || 'Administrator'} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin RT/RW'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'admin@siaga.id'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#162124] text-slate-100 p-4 sm:p-6 lg:p-8">
        {!isAdmin && (
          <div className="mb-6 rounded-2xl bg-amber-500/15 border border-amber-500/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-sm font-bold text-amber-300">Hak Akses Terbatas (Akun Saat Ini: {user?.name || 'Warga'})</h4>
                <p className="text-xs text-amber-200/90">
                  Untuk mengoperasikan semua fitur admin (verifikasi iuran, CCTV, kas, dan direktori warga) tanpa pesan "Akses Ditolak", klik tombol di samping.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSwitchToAdmin}
              disabled={switching}
              className="shrink-0 rounded-xl bg-[#F7B538] px-4 py-2 text-xs font-bold text-[#0F4C5C] shadow-md hover:bg-[#e5a52c] transition"
            >
              {switching ? 'Beralih...' : 'Login Pengurus RT (Admin) Otomatis'}
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}

