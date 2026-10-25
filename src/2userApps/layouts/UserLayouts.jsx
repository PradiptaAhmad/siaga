import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../../components/user/UserSidebar";
import logoUtama from "../../assets/img/Hero/logoUtama.png";

function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EBEEED] font-sans md:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        {/* Top bar - hanya tampil di mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 shadow-md md:hidden">
          <img src={logoUtama} alt="Logo SIAGA" className="h-8 w-auto object-contain" />
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#26383D] transition hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Konten halaman */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;