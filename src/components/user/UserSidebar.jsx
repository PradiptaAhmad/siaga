import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import logoUtama from "../../assets/img/Hero/logoUtama.png";
import iconDashboard from "../../assets/img/UserDashboard/SidebarDash.png";
import iconIuran from "../../assets/img/UserDashboard/SidebarIuran.png";
import iconAduan from "../../assets/img/UserDashboard/SidebarAduan.png";
import iconKeamanan from "../../assets/img/UserDashboard/iconPenanganan.png";
import iconAspirasi from "../../assets/img/UserDashboard/SidebarPartisipasi.png";
import iconProfil from "../../assets/img/UserDashboard/SidebarProfile.png";
import { useAuth } from "../../context/AuthContext";

const menus = [
  { label: "Dashboard", to: "/user/dashboard", altTo: "/dashboard", icon: iconDashboard },
  { label: "Iuran & Keuangan", to: "/user/iuran", altTo: "/dashboard/iuran", icon: iconIuran },
  { label: "Aduan & Permohonan", to: "/user/aduan", altTo: "/dashboard/aduan", icon: iconAduan },
  { label: "Keamanan Lingkungan", to: "/user/keamanan", altTo: "/dashboard/keamanan", icon: iconKeamanan },
  { label: "Aspirasi & Partisipasi", to: "/user/aspirasi", altTo: "/dashboard/aspirasi", icon: iconAspirasi },
  { label: "Profil Pengguna", to: "/user/profil", altTo: "/dashboard/profil", icon: iconProfil },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (onClose) onClose();
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Mobile: drawer geser dari kiri | Tablet & Desktop: sidebar tetap */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#26383D] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:translate-x-0 lg:w-[234px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Tombol tutup (mobile) */}
        <div className="flex justify-end px-3 pt-3 md:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>

        {/* Logo */}
        <div className="mx-3 mt-2 flex items-center justify-center rounded-xl bg-white px-3 py-3 shadow-md md:mt-3">
          <a href="/">
            <img src={logoUtama} alt="Logo SIAGA" className="h-14 w-auto object-contain md:h-16" />
          </a>
        </div>

        {/* Menu */}
        <nav className="mt-8 flex-1 px-2 md:mt-12" aria-label="Menu utama">
          <ul className="space-y-1.5">
            {menus.map((menu) => {
              const isActive =
                location.pathname === menu.to ||
                location.pathname === menu.altTo ||
                (menu.to === "/user/dashboard" && (location.pathname === "/user" || location.pathname === "/dashboard"));

              return (
                <li key={menu.to}>
                  <NavLink
                    to={menu.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#F4B740] text-[#26383D] shadow-md"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <img src={menu.icon} alt="" className="h-4 w-4 shrink-0 object-contain" />
                    <span>{menu.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card & Tombol Logout */}
        <div className="mt-auto border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-2.5 px-2 py-1.5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3CC4B0] text-xs font-bold text-[#26383D]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "W"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user?.name || "Warga SIAGA"}</p>
              <p className="truncate text-[10px] text-white/60">
                {user?.role === "admin" ? "Pengurus RT/RW" : `KK: ${user?.no_kk || "-"}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600/20 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-600 hover:text-white"
          >
            <LogOut size={15} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
