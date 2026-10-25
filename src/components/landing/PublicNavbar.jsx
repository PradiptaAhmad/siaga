import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  LayoutGrid,
  Menu,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import Logo from '../ui/Logo'

const links = [
  { label: 'Mengapa SIAGA', href: '#mengapa', icon: HelpCircle, num: '01' },
  { label: 'Dokumentasi & Demo', href: '#dokumentasi', icon: Receipt, num: '02' },
  { label: 'Pantau Aduan Publik', href: '#pantau-aduan', icon: FileCheck2, num: '03' },
  { label: 'Overview Layanan', href: '#overview', icon: LayoutGrid, num: '04' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    let lastState = window.scrollY > 24
    setScrolled(lastState)

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 24
          if (isScrolled !== lastState) {
            lastState = isScrolled
            setScrolled(isScrolled)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* 1. Desktop & Mobile Header Bar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transform-gpu will-change-transform transition-all duration-300 ${
          scrolled
            ? 'border-b border-sand-200/80 bg-sand-50/95 py-2.5 shadow-[0_8px_32px_-24px_rgba(11,43,34,0.3)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent py-3.5 sm:py-4'
        }`}
      >
        <div className="container-page flex items-center justify-between gap-4">
          <Logo light={!scrolled} />

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  scrolled
                    ? 'text-ink-600 hover:bg-sand-100 hover:text-forest-900'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <Link
              to="/login"
              className={`btn h-10 px-4.5 text-xs font-bold transition ${
                scrolled
                  ? 'text-forest-900 hover:bg-sand-200/70 border border-sand-200'
                  : 'text-white hover:bg-white/10 border border-white/20'
              }`}
            >
              Masuk
            </Link>
            <a
              href="#mulai"
              className={`btn h-10 gap-1.5 px-4.5 text-xs font-bold transition shadow-sm ${
                scrolled
                  ? 'bg-forest-900 text-white hover:bg-forest-800'
                  : 'bg-lime-400 text-forest-950 hover:bg-lime-300'
              }`}
            >
              Mulai Terhubung
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/login"
              className={`btn h-9 px-3 text-xs font-bold sm:hidden ${
                scrolled
                  ? 'bg-forest-900 text-white'
                  : 'bg-lime-400 text-forest-950'
              }`}
            >
              Masuk
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`grid h-10 w-10 place-items-center rounded-xl transition shadow-xs ${
                scrolled
                  ? 'bg-sand-200/80 text-forest-900 hover:bg-sand-300'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Mobile Sidebar Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-forest-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* 3. Mobile Sidebar Drawer Panel (Slide-in from Right) */}
      <aside
        className={`fixed inset-y-0 right-0 z-[70] w-[86vw] max-w-sm bg-forest-950 text-white shadow-2xl flex flex-col justify-between border-l border-white/10 transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header inside Drawer */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-forest-900/60">
          <Logo light />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Tutup menu sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Community Status Pill in Drawer */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="font-semibold text-white/90">RT 004 / RW 002</span>
            </div>
            <span className="text-[10px] font-mono text-lime-300/80 uppercase">Griya Asri</span>
          </div>
        </div>

        {/* Scrollable Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
            Menu Navigasi Warga
          </p>

          {links.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-lime-300 group-hover:bg-lime-400/20 transition">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{link.label}</span>
                </div>
                <span className="font-mono text-xs text-white/30 group-hover:text-lime-300 transition">
                  {link.num}
                </span>
              </a>
            )
          })}
        </nav>

        {/* Bottom Drawer Actions */}
        <div className="p-5 border-t border-white/10 bg-forest-900/40 space-y-3">
          <div className="flex items-start gap-2.5 rounded-2xl bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
            <span>Keterbukaan informasi dan hak pilih terenkripsi aman untuk warga.</span>
          </div>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="btn w-full bg-lime-400 hover:bg-lime-300 py-3 text-forest-950 font-extrabold text-sm shadow-md flex items-center justify-center gap-2 rounded-xl"
          >
            <span>Masuk ke Dashboard Warga</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Pengurus%20SIAGA,%20saya%20ingin%20tanya%20seputar%20warga"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="btn w-full border border-white/20 bg-white/5 hover:bg-white/10 py-2.5 text-white text-xs font-semibold flex items-center justify-center gap-2 rounded-xl"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>Hubungi Pengurus RT via WA</span>
          </a>
        </div>
      </aside>
    </>
  )
}
