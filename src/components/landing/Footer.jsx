import { useState } from 'react'
import { ArrowRight, ArrowUp, CheckCircle2, ChevronDown, Heart, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import logoUtama from '../../assets/img/Hero/logoUtama.png'

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Beranda SIAGA', href: '#beranda' },
      { label: 'Fitur Transparansi', href: '#fitur' },
      { label: 'Tujuan & Alasan', href: '#tujuan' },
      { label: 'Ringkasan Layanan', href: '#ringkasan' },
      { label: 'Tanya Jawab (FAQ)', href: '#faq' },
    ],
  },
  {
    title: 'Layanan Warga',
    links: [
      { label: 'Iuran & Keuangan', href: '/login' },
      { label: 'Aduan & Permohonan', href: '/login' },
      { label: 'Aspirasi & Voting', href: '/login' },
      { label: 'Keamanan CCTV', href: '/login' },
    ],
  },
  {
    title: 'Sekretariat RW',
    contacts: [
      { icon: MapPin, text: 'Balai Warga RT 004 / RW 002, Griya Asri, Sidoarjo' },
      { icon: Phone, text: '0812-5555-0101' },
      { icon: Mail, text: 'halo@siaga.id' },
    ],
    extra: 'Senin–Sabtu, 08.00–16.00 WIB',
  },
]

function FooterSection({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/10 sm:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 sm:py-0 sm:pointer-events-none"
      >
        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#F7B538]">
          {section.title}
        </h4>
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-200 sm:!max-h-[500px] sm:!opacity-100 sm:mt-4 ${open ? 'max-h-[500px] opacity-100 pb-3' : 'max-h-0 opacity-0'}`}>
        {section.links && (
          <ul className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-0">
            {section.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-[13px] text-white/70 transition hover:text-white"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-[#F7B538]" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {section.contacts && (
          <div className="space-y-2.5 pt-1 sm:pt-0">
            {section.contacts.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.text} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white/70">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3CC4B0]" />
                  <span>{c.text}</span>
                </div>
              )
            })}
            {section.extra && (
              <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/60">
                Jam layanan: <span className="font-semibold text-white/80">{section.extra}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#26383D] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:py-16 md:px-10 lg:px-[110px]">
        {/* Desktop: 4-column grid | Mobile: stacked accordion */}
        <div className="grid gap-0 sm:gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand Column */}
          <div className="pb-5 mb-1 border-b border-white/10 sm:border-0 sm:pb-0 sm:mb-0">
            <div className="flex items-center gap-2">
              <img src={logoUtama} alt="Logo SIAGA" className="h-9 w-auto brightness-0 invert" />
            </div>
            <p className="mt-3 sm:mt-5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/70">
              Sistem Informasi Aspirasi & Gotong Royong Warga. Satu ruang terbuka untuk iuran, aduan, aspirasi musyawarah, dan keamanan lingkungan hunian.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-medium text-white/70">
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#3CC4B0]" />
                Data terlindungi
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-medium text-white/70">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F7B538]" />
                Transparan & terverifikasi
              </span>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <FooterSection key={section.title} section={section} />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-14 flex flex-col gap-3 sm:gap-4 border-t border-white/10 pt-5 sm:pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] sm:text-xs text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} SIAGA — Sistem Informasi Aspirasi & Gotong Royong Warga.
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-5 text-[10px] sm:text-xs text-white/50">
            <a href="#tujuan" className="transition hover:text-white">Kebijakan Privasi</a>
            <a href="#tujuan" className="transition hover:text-white">Ketentuan Layanan</a>
            <span className="inline-flex items-center gap-1">
              Dibuat dengan <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-[#F7B538] text-[#F7B538]" /> untuk warga
            </span>
          </div>
        </div>
      </div>

      <a
        href="#beranda"
        aria-label="Kembali ke atas"
        className="absolute bottom-6 right-4 sm:bottom-8 sm:right-6 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white/70 transition hover:border-[#F7B538] hover:text-[#F7B538]"
      >
        <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </a>
    </footer>
  )
}
