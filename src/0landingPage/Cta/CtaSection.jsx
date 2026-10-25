import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="relative w-full bg-[#0F5A6B] text-white py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-[110px] relative z-10">
        <div className="rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-12 backdrop-blur-md">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
            <div>
              <span className="inline-block rounded-full bg-[#F7B538] px-3.5 py-1 text-[11px] font-extrabold text-[#0F5A6B]">
                Siap Memulai Keterbukaan?
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Mulai Terhubung dengan SIAGA Hari Ini
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                Bagi kepala keluarga yang telah terdaftar di lingkungan RT 004 / RW 002, Anda dapat langsung masuk menggunakan akun warga yang telah diberikan oleh pengurus.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/login"
                  className="rounded-lg bg-[#F7B538] text-[#0F5A6B] h-11 px-6 text-xs sm:text-sm font-bold shadow-lg transition hover:bg-[#e2a229] flex items-center justify-center gap-2"
                >
                  Masuk Akun Warga
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Pengurus%20SIAGA,%20saya%20ingin%20verifikasi%20akun%20KK"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 h-11 px-5 text-xs sm:text-sm font-semibold transition flex items-center justify-center"
                >
                  Hubungi Pengurus RT
                </a>
              </div>
            </div>

            {/* Demo Box */}
            <div className="rounded-2xl border border-white/15 bg-[#26383D]/90 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#F7B538]">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Akses Uji Coba Demo</p>
              </div>
              <p className="text-xs text-white/70">
                Gunakan kredensial akun demo berikut untuk langsung mengeksplorasi seluruh fitur:
              </p>
              <div className="space-y-2 font-mono text-xs bg-black/20 p-3.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Warga KK:</span>
                  <span className="text-[#3CC4B0] font-bold">warga@siaga.id</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Admin RT:</span>
                  <span className="text-[#F7B538] font-bold">admin@siaga.id</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/10">
                  <span className="text-white/50">Password:</span>
                  <span className="text-white font-bold">password123</span>
                </div>
              </div>

              <Link
                to="/login"
                className="block text-center text-xs font-bold text-[#F7B538] hover:underline"
              >
                Klik di sini untuk langsung ke Halaman Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

