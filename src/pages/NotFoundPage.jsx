import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col justify-center items-center px-4 text-center">
      <Logo to="/" />
      <div className="mt-8 max-w-md card p-8">
        <span className="text-6xl font-extrabold text-emerald-700 font-mono">404</span>
        <h1 className="mt-4 text-xl font-bold text-forest-900">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-xs text-ink-500 leading-relaxed">
          Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau alamat URL salah.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="w-full sm:w-auto btn-primary text-xs h-10 px-5">
            Ke Dashboard Warga
          </Link>
          <Link to="/" className="w-full sm:w-auto btn-outline text-xs h-10 px-5">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

