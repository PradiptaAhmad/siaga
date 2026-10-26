import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Users,
  MessageSquareWarning,
  Camera,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react'
import api from '../../lib/api'
import { formatRupiah, formatDate } from '../../lib/format'
import { getCached, setCached } from '../../lib/cache'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async (isBackground = false) => {
    if (!isBackground) {
      const cached = getCached('admin_dashboard_data')
      if (cached) {
        setData(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
    }

    try {
      const res = await api.get('/admin/dashboard')
      setData(res.data)
      setCached('admin_dashboard_data', res.data, 15000)
    } catch (err) {
      console.error(err)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    // Realtime background polling setiap 6 detik
    const interval = setInterval(() => {
      fetchDashboard(true)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  const stats = data?.stats || {}
  const recentComplaints = data?.recent_complaints || []
  const recentPayments = data?.recent_payments || []
  const cameras = data?.cameras || []

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Portal Administrasi Pengurus
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Pusat Kendali Transparansi SIAGA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola data warga, verifikasi kas dan iuran, serta pantau keamanan lingkungan real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white inline-flex items-center gap-1.5 transition border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Saldo Kas */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saldo Kas RT/RW</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {formatRupiah(stats.saldo_kas ?? 0)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1 text-emerald-300">
              <TrendingUp className="h-3 w-3" /> +{formatRupiah(stats.kas_masuk ?? 0)}
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <TrendingDown className="h-3 w-3" /> -{formatRupiah(stats.kas_keluar ?? 0)}
            </span>
          </div>
        </div>

        {/* Verifikasi Pembayaran Pending */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verifikasi Pembayaran</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {stats.payments_pending ?? 0}{' '}
            <span className="text-xs font-normal text-amber-400">menunggu</span>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px]">
            <Link
              to="/admin/pembayaran"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Periksa bukti transfer <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Aduan Perlu Ditindak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aduan Pending</span>
            <MessageSquareWarning className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {stats.aduan_pending ?? 0}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.aduan_total ?? 0}</span>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px]">
            <Link
              to="/admin/aduan"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Tindak lanjuti aduan warga <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* CCTV Lingkungan */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kamera CCTV</span>
            <Camera className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {stats.cctv_online ?? 0} / {stats.cctv_total ?? 0}{' '}
            <span className="text-xs font-normal text-slate-400">Online</span>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px]">
            <Link
              to="/admin/cctv"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Set VDO.Ninja & Stream <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Pending Payments & Complaints */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Payments Waiting Approval */}
        <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white">Verifikasi Pembayaran Terbaru</h2>
              <p className="text-xs text-slate-400">Konfirmasi bukti transfer dari warga</p>
            </div>
            <Link
              to="/admin/pembayaran"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Tidak ada pembayaran yang menunggu verifikasi.
              </p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.user?.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (RT {p.user?.rt || '004'})
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{p.keterangan}</p>
                    <p className="text-[11px] font-mono text-emerald-400 mt-0.5 font-bold">
                      {formatRupiah(p.jumlah)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        p.status === 'terverifikasi'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : p.status === 'ditolak'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                    <Link
                      to="/admin/pembayaran"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium"
                    >
                      Periksa
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints Ticket Status */}
        <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white">Aduan Masuk Terkini</h2>
              <p className="text-xs text-slate-400">Laporan warga yang butuh respon pengurus</p>
            </div>
            <Link
              to="/admin/aduan"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentComplaints.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Belum ada aduan warga yang masuk.
              </p>
            ) : (
              recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{c.judul}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                        {c.kategori}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5">
                      Pelapor: {c.user?.name} • {formatDate(c.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        c.status === 'selesai'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : c.status === 'diproses'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {c.status}
                    </span>
                    <Link
                      to="/admin/aduan"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium"
                    >
                      Respon
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CCTV Overview Grid */}
      <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">Ringkasan Titik CCTV Lingkungan</h2>
            <p className="text-xs text-slate-400">
              Konfigurasi streaming VDO.Ninja dan status koneksi live kamera
            </p>
          </div>
          <Link
            to="/admin/cctv"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Camera className="h-3.5 w-3.5" /> Atur Kamera & URL
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cameras.map((cam) => {
            const isOnline = cam.status === 'online'
            return (
              <div
                key={cam.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      CAM #{String(cam.id).padStart(2, '0')}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <h3 className="font-bold text-white text-xs mt-1">{cam.nama}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cam.lokasi}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">
                    {cam.stream_url ? 'STREAM SET' : 'NO URL'}
                  </span>
                  <span
                    className={
                      isOnline ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'
                    }
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

