import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FileCheck2,
} from 'lucide-react'
import api from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useAuth } from '../../context/AuthContext'

const statusMap = {
  dikirim: {
    label: 'Menunggu Pemeriksaan',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
  },
  diperiksa: {
    label: 'Sedang Diperiksa RT/RW',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    dot: 'bg-sky-500',
  },
  diproses: {
    label: 'Dalam Pengerjaan / Tindak Lanjut',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    dot: 'bg-indigo-500 animate-pulse',
  },
  selesai: {
    label: 'Tuntas & Selesai',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  ditolak: {
    label: 'Ditolak / Tidak Valid',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    dot: 'bg-rose-500',
  },
}

export default function PublicComplaintsSection() {
  const { isAuthenticated } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({ total: 0, selesai: 0, diproses: 0, dikirim: 0, tingkat_penyelesaian: 100 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [catFilter, setCatFilter] = useState('semua')

  const fetchPublicComplaints = async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const res = await api.get('/public/complaints', {
        params: {
          q: search || undefined,
          status: statusFilter !== 'semua' ? statusFilter : undefined,
          kategori: catFilter !== 'semua' ? catFilter : undefined,
        },
      })
      setComplaints(res.data.complaints || [])
      setStats(res.data.stats || { total: 0, selesai: 0, diproses: 0, dikirim: 0, tingkat_penyelesaian: 100 })
      if (res.data.categories?.length) {
        setCategories(res.data.categories)
      }
    } catch {
      // ignore
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicComplaints()
    const timer = setInterval(() => {
      fetchPublicComplaints(true)
    }, 10000)
    return () => clearInterval(timer)
  }, [search, statusFilter, catFilter])

  return (
    <section id="pantau-aduan" className="py-20 lg:py-28 bg-sand-100/60 border-y border-sand-200">
      <div className="container-page">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Transparansi Publik Terbuka 24 Jam (Tanpa Login)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight">
            Pantau Status Aduan & Keluhan Warga Secara Terbuka
          </h2>

          <p className="mt-4 text-sm sm:text-base text-ink-500 leading-relaxed">
            Semua orang dapat memantau secara terbuka apakah aduan fasilitas umum telah diperiksa, sedang dikerjakan, atau sudah tuntas.
            Keterbukaan ini menjamin transparansi kinerja pengurus lingkungan.
          </p>
        </div>

        {/* 4 Key Public Stats Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="card p-5 bg-white shadow-soft">
            <span className="text-xs text-ink-500 font-semibold">Total Aduan Masuk</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-forest-900 mt-2">
              {stats.total}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">Laporan resmi warga</p>
          </div>

          <div className="card p-5 bg-white shadow-soft">
            <span className="text-xs text-indigo-700 font-semibold">Dalam Pengerjaan</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-700 mt-2">
              {stats.diproses + stats.dikirim}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">Teknisi & tim lapangan</p>
          </div>

          <div className="card p-5 bg-white shadow-soft">
            <span className="text-xs text-emerald-700 font-semibold">Tuntas / Selesai</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-2">
              {stats.selesai}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">Perbaikan selesai disahkan</p>
          </div>

          <div className="card p-5 bg-forest-950 text-white shadow-soft">
            <span className="text-xs text-white/70 font-semibold">Tingkat Penyelesaian</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-lime-300 mt-2">
              {stats.tingkat_penyelesaian}%
            </p>
            <p className="text-[11px] text-white/50 mt-1">Efisiensi tindak lanjut</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="card p-4 sm:p-5 mb-8 bg-white shadow-soft space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode tiket, judul keluhan, atau lokasi..."
                className="input pl-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'semua', label: 'Semua Status' },
                { id: 'diproses', label: 'Dalam Pengerjaan' },
                { id: 'selesai', label: 'Selesai' },
                { id: 'dikirim', label: 'Menunggu' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === s.id
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Grid */}
        {loading && complaints.length === 0 ? (
          <div className="py-20 text-center">
            <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-ink-500 font-medium">Memuat data transparansi aduan...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <MessageSquareWarning className="h-12 w-12 text-sand-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-forest-900">Belum Ada Aduan yang Ditampilkan</h4>
            <p className="text-xs text-ink-500 mt-1 max-w-md mx-auto">
              Tidak ada aduan yang sesuai dengan filter pencarian Anda, atau seluruh fasilitas lingkungan dalam kondisi prima.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((item) => {
              const st = statusMap[item.status] || {
                label: item.status,
                badge: 'bg-sand-100 text-ink-800 border-sand-300',
                dot: 'bg-sand-500',
              }
              const latestUpdate = item.updates?.[0]

              return (
                <div
                  key={item.id}
                  className="card p-5 bg-white hover:border-emerald-500/40 hover:shadow-lift transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Card: Code & Status */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-100">
                      <span className="font-mono text-xs font-extrabold text-emerald-800">
                        #{item.kode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.badge}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                        {item.kategori}
                      </span>
                      <h4 className="text-sm font-extrabold text-forest-900 mt-0.5 line-clamp-2 leading-snug">
                        {item.judul}
                      </h4>
                      <p className="text-xs text-ink-500 mt-2 line-clamp-3 leading-relaxed">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Location & Reporter (Masked) */}
                    <div className="mt-4 pt-3 border-t border-sand-100 space-y-1 text-[11px] text-ink-500">
                      {item.lokasi && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                          <span className="truncate">Titik: <strong className="text-ink-700">{item.lokasi}</strong></span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5 text-ink-400">
                        <span>Pelapor: <strong>{item.pelapor}</strong></span>
                        <span>•</span>
                        <span>{formatDate(item.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Latest Update or Response from RT */}
                  {item.tanggapan || latestUpdate ? (
                    <div className="mt-4 pt-3 border-t border-sand-200/80 bg-sand-50/70 p-3 rounded-2xl text-[11px]">
                      <div className="flex items-center gap-1.5 text-forest-900 font-bold mb-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Respon Pengurus RT/RW:</span>
                      </div>
                      <p className="text-ink-600 line-clamp-2 italic">
                        "{item.tanggapan || latestUpdate?.catatan}"
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-sand-100 text-[11px] text-ink-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Menunggu giliran penugasan tim lapangan</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* BOTTOM NOTICE & CALL TO ACTION */}
        <div className="mt-12 rounded-3xl border border-emerald-600/30 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-lift">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-lime-400/10 blur-[70px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-lime-300 text-xs font-bold">
                <Lock className="h-3.5 w-3.5" />
                <span>Ketentuan Pembuatan Aduan Warga</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Punya Keluhan Fasilitas atau Permohonan Administrasi?
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Halaman ini dapat dipantau oleh <strong>seluruh publik tanpa login</strong>. Namun, demi menjaga
                keaslian dan mencegah laporan palsu, <strong>hanya warga terdaftar (Kepala Keluarga) yang dapat mengirimkan aduan baru</strong>.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard/aduan"
                  className="btn-lime h-11 px-6 text-xs sm:text-sm font-bold shadow-lg"
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  + Buat Aduan di Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-lime h-11 px-6 text-xs sm:text-sm font-bold shadow-lg inline-flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Masuk untuk Buat Aduan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

