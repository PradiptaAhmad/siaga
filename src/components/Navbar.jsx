import { useState } from "react";
import { Link } from "react-router-dom";
import logoUtama from "../assets/img/Hero/logoUtama.png";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Tujuan", href: "#tujuan" },
  { label: "Ringkasan", href: "#ringkasan" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const { isAuthenticated, user } = useAuth();

  const targetLink = isAuthenticated
    ? user?.role === "admin"
      ? "/admin"
      : "/user/dashboard"
    : "/login";
  const targetLabel = isAuthenticated ? "Dashboard" : "Login";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      {/* Bar utama */}
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10 lg:px-[110px]">
        {/* Logo */}
        <a href="#beranda" onClick={closeMenu} className="flex items-center">
          <img
            src={logoUtama}
            alt="Logo SIAGA"
            className="h-8 w-auto object-contain md:h-10"
          />
        </a>

        {/* Menu (tablet & desktop) */}
        <ul className="hidden items-center gap-8 md:flex lg:gap-[72px]">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[13px] font-semibold text-[#0F5A6B] transition-colors hover:text-[#F7B538]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Tombol Login (tablet & desktop) */}
        <Link
          to={targetLink}
          className="hidden rounded-lg bg-[#0F5A6B] px-8 py-2.5 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#0c4756] md:inline-block"
        >
          {targetLabel}
        </Link>

        {/* Tombol hamburger (mobile) */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#0F5A6B] transition hover:bg-gray-100 md:hidden"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Dropdown menu (mobile) */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-gray-100 bg-white px-5 pb-5 pt-2 shadow-md md:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block border-b border-gray-100 py-3 text-sm font-semibold text-[#0F5A6B] transition-colors hover:text-[#F7B538]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to={targetLink}
            onClick={closeMenu}
            className="mt-4 block rounded-lg bg-[#0F5A6B] py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#0c4756]"
          >
            {targetLabel}
          </Link>
        </div>
      )}
    </header>
  );
}
