import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  FileCheck2,
  Vote,
  Camera,
  Eye,
  ArrowRight,
  TrendingUp,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Siren,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Flame,
  HeartPulse,
  Users2,
} from 'lucide-react'
import api from '../../lib/api'
import { formatRupiah, formatDate, formatDateShort, formatDateTime, relativeTime } from '../../lib/format'
import CctvPlayer from '../../components/security/CctvPlayer'

const complaintStatusMap = {
  dikirim: {
    label: 'Menunggu Pemeriksaan',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  diperiksa: {
    label: 'Sedang Diperiksa RT/RW',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  diproses: {
    label: 'Dalam Pengerjaan',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500 animate-pulse',
  },
  selesai: {
    label: 'Tuntas & Selesai',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ditolak: {
    label: 'Ditolak',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
  },
}

export default function FiturSection() {
  const [activeTab, setActiveTab] = useState('kas')

  // Kas State
  const [kasSummary, setKasSummary] = useState({ saldo: 0, total_masuk: 0, total_keluar: 0, transaksi: 0 })
  const [kasTransactions, setKasTransactions] = useState([])
  const [loadingKas, setLoadingKas] = useState(true)

  // Aduan State
  const [complaints, setComplaints] = useState([])
  const [complaintStats, setComplaintStats] = useState({ total: 0, selesai: 0, diproses: 0, dikirim: 0, tingkat_penyelesaian: 100 })
  const [complaintSearch, setComplaintSearch] = useState('')
  const [complaintStatus, setComplaintStatus] = useState('semua')
  const [loadingComplaints, setLoadingComplaints] = useState(true)

  // Voting State
  const [votings, setVotings] = useState([])
  const [loadingVoting, setLoadingVoting] = useState(true)

  // Security & CCTV State
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState(null)
  const [contacts, setContacts] = useState([])
  const [loadingSecurity, setLoadingSecurity] = useState(true)

  // Initial Fetch for Kas, Voting, Security
  useEffect(() => {
    // Check hash targets
    if (window.location.hash === '#pantau-aduan') {
      setActiveTab('aduan')
    }

    const handleHash = () => {
      if (window.location.hash === '#pantau-aduan') {
        setActiveTab('aduan')
        const el = document.getElementById('fitur')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('hashchange', handleHash)

    // Fetch Kas
    api.get('/public/kas')
      .then(res => {
        if (res.data) {
          setKasSummary(res.data.summary || { saldo: 0, total_masuk: 0, total_keluar: 0, transaksi: 0 })
          setKasTransactions(res.data.transactions || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingKas(false))

    // Fetch Security
    api.get('/public/security')
      .then(res => {
        if (res.data) {
          const cams = res.data.cameras || []
          setCameras(cams)
          if (cams.length > 0) setSelectedCameraId(cams[0].id)
          setContacts(res.data.contacts || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSecurity(false))

    // Fetch Votings
    api.get('/public/votings')
      .then(res => {
        if (res.data) {
          setVotings(res.data.votings || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVoting(false))

    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Complaints fetch with query filters
  useEffect(() => {
    setLoadingComplaints(true)
    api.get('/public/complaints', {
      params: {
        q: complaintSearch || undefined,
        status: complaintStatus !== 'semua' ? complaintStatus : undefined,
      }
    })
      .then(res => {
        if (res.data) {
          setComplaints(res.data.complaints || [])
          setComplaintStats(res.data.stats || { total: 0, selesai: 0, diproses: 0, dikirim: 0, tingkat_penyelesaian: 100 })
        }
      })
      .catch(() => {})
      .finally(() => setLoadingComplaints(false))
  }, [complaintSearch, complaintStatus])

  return (
    <section id="fitur" className="relative w-full scroll-mt-16 bg-[#F3F4F4]/70 py-14 sm:py-20 md:scroll-mt-[72px] lg:py-24 border-y border-gray-200">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-[110px]">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F5A6B]/20 bg-[#BFE3DA]/40 px-4 py-1.5 text-xs font-bold text-[#0F5A6B] mb-3">
            <Eye className="h-3.5 w-3.5 text-[#0F5A6B]" />
            <span>Transparansi Publik Terbuka (View Only)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F5A6B] md:text-3xl lg:text-4xl tracking-tight">
            Lihat SIAGA Lebih Dekat
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#2F5F6A] leading-relaxed">
            Telusuri bagaimana antarmuka SIAGA memudahkan warga mengawasi kas lingkungan, melacak aduan, berpartisipasi dalam musyawarah, dan memantau CCTV gerbang.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="mt-8 sm:mt-10 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0 px-1 sm:justify-center">
          {[
            { id: 'kas', fullLabel: 'Kas Lingkungan & Iuran', icon: Receipt },
            { id: 'aduan', fullLabel: 'Pelacakan Aduan Real-Time', icon: FileCheck2 },
            { id: 'voting', fullLabel: 'Voting Aspirasi & Program', icon: Vote },
            { id: 'keamanan', fullLabel: 'Keamanan & CCTV Warga', icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all shadow-sm ${
                  active
                    ? 'bg-[#0F5A6B] text-white shadow-md'
                    : 'bg-white text-[#26383D] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#F7B538]' : 'text-[#0F5A6B]'}`} />
                <span>{tab.fullLabel}</span>
              </button>
            )
          })}
        </div>

        {/* Showcase Container */}
        <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 border border-gray-200 shadow-md">
          {/* TAB 1: KAS LINGKUNGAN & IURAN */}
          {activeTab === 'kas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-[#BFE3DA]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#0F5A6B]">
                      Modul Keuangan Terbuka
                    </span>
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                      View Only
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#0F5A6B]">
                    Buku Kas Terbuka & Verifikasi Transaksi Lingkungan
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Setiap warga dan pengunjung dapat mengaudit pemasukan iuran rutin, sumbangan sukarela, dan pos pengeluaran RT secara transparan langsung dari pembukuan sistem.
                  </p>
                </div>
                <div className="text-left sm:text-right bg-[#F3F4F4] p-3.5 sm:p-4 rounded-xl border border-gray-200 sm:border-0 sm:bg-transparent sm:p-0">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Saldo Kas Lingkungan</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0F5A6B] font-mono mt-0.5">
                    {formatRupiah(kasSummary.saldo)}
                  </p>
                </div>
              </div>

              {/* 3 Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Total Pemasukan Kas</span>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    +{formatRupiah(kasSummary.total_masuk)}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 mt-0.5">Iuran warga & sumbangan resmi</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Total Pengeluaran Kas</span>
                  <p className="text-lg sm:text-xl font-extrabold text-rose-700 font-mono mt-1">
                    -{formatRupiah(kasSummary.total_keluar)}
                  </p>
                  <p className="text-[11px] text-rose-600/80 mt-0.5">Pemeliharaan & operasional</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0F5A6B] text-white">
                  <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Total Mutasi Transaksi</span>
                  <p className="text-lg sm:text-xl font-extrabold text-[#F7B538] font-mono mt-1">
                    {kasSummary.transaksi || kasTransactions.length} Transaksi
                  </p>
                  <p className="text-[11px] text-white/60 mt-0.5">Tercatat dalam pembukuan resmi</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#0F5A6B]">Catatan Mutasi Transaksi Terakhir (Live Database)</p>
                  <span className="text-[11px] text-gray-500 font-mono">{kasTransactions.length} transaksi</span>
                </div>

                {loadingKas ? (
                  <div className="p-8 text-center text-gray-500 text-xs">Memuat data pembukuan kas...</div>
                ) : kasTransactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">Belum ada transaksi kas yang tercatat.</div>
                ) : (
                  <>
                    {/* Mobile Card List */}
                    <div className="block sm:hidden divide-y divide-gray-100">
                      {kasTransactions.slice(0, 8).map((tx) => (
                        <div key={tx.id} className="p-3.5 space-y-2 hover:bg-gray-50/60 transition">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-gray-500">{formatDateShort(tx.tanggal)}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {tx.kategori}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-[#26383D] leading-snug">
                            {tx.keterangan}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                            <span className="text-[10px] text-gray-500 font-mono">
                              Saldo: <strong className="text-gray-800">{formatRupiah(tx.saldo_setelah)}</strong>
                            </span>
                            <span className={`font-mono font-bold text-xs ${
                              tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {tx.jenis === 'masuk' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[540px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                          <tr>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Uraian Transaksi</th>
                            <th className="p-3">Kategori</th>
                            <th className="p-3 text-right">Jumlah</th>
                            <th className="p-3 text-right">Saldo Berjalan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {kasTransactions.slice(0, 8).map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/70 transition">
                              <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                                {formatDateShort(tx.tanggal)}
                              </td>
                              <td className="p-3 font-medium text-[#26383D]">
                                {tx.keterangan}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  tx.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {tx.kategori}
                                </span>
                              </td>
                              <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                                tx.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {tx.jenis === 'masuk' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                              </td>
                              <td className="p-3 text-right font-mono font-semibold text-gray-800 whitespace-nowrap">
                                {formatRupiah(tx.saldo_setelah)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Notice */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Eye className="h-4 w-4 text-[#0F5A6B] shrink-0" />
                  <span>
                    Data kas di atas bersifat <strong>View Only</strong> untuk transparansi publik warga. Untuk melakukan pembayaran iuran warga via Midtrans QRIS/Bank Transfer, silakan masuk ke Akun Warga.
                  </span>
                </div>
                <Link
                  to="/login"
                  className="rounded-lg bg-[#0F5A6B] text-white px-4 py-2 font-bold inline-flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#0c4756] transition w-full sm:w-auto shrink-0"
                >
                  Bayar Iuran Warga <ArrowRight className="h-3.5 w-3.5 text-[#F7B538]" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: PELACAKAN ADUAN REAL-TIME */}
          {activeTab === 'aduan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                      Sistem Tiket Aduan Terbuka
                    </span>
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                      View Only
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#0F5A6B]">
                    Pelacakan Aduan & Kerusakan Fasilitas Secara Real-Time
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Semua orang dapat memantau secara terbuka apakah aduan fasilitas umum telah diperiksa, sedang dikerjakan, atau sudah tuntas diselesaikan oleh teknisi/pengurus lingkungan.
                  </p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <Link
                    to="/login"
                    className="rounded-lg bg-[#0F5A6B] text-white text-xs font-bold px-4 py-2.5 inline-flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#0c4756] transition w-full sm:w-auto"
                  >
                    Buat Aduan Baru <ArrowRight className="h-3.5 w-3.5 text-[#F7B538]" />
                  </Link>
                </div>
              </div>

              {/* 4 Stat Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[11px] text-gray-500 font-semibold">Total Aduan Masuk</span>
                  <p className="text-lg sm:text-2xl font-extrabold font-mono text-[#0F5A6B] mt-1">
                    {complaintStats.total}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Laporan resmi warga</p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-[11px] text-indigo-800 font-semibold">Dalam Pengerjaan</span>
                  <p className="text-lg sm:text-2xl font-extrabold font-mono text-indigo-700 mt-1">
                    {complaintStats.diproses + complaintStats.dikirim}
                  </p>
                  <p className="text-[10px] text-indigo-600/80 mt-0.5">Teknisi & tindak lanjut</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-semibold">Tuntas / Selesai</span>
                  <p className="text-lg sm:text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                    {complaintStats.selesai}
                  </p>
                  <p className="text-[10px] text-emerald-600/80 mt-0.5">Perbaikan disahkan</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0F5A6B] text-white">
                  <span className="text-[11px] text-white/70 font-semibold">Penyelesaian</span>
                  <p className="text-lg sm:text-2xl font-extrabold font-mono text-[#F7B538] mt-1">
                    {complaintStats.tingkat_penyelesaian}%
                  </p>
                  <p className="text-[10px] text-white/60 mt-0.5">Efisiensi tindak lanjut</p>
                </div>
              </div>

              {/* Search Bar & Filter Status */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    placeholder="Cari tiket, judul, atau lokasi..."
                    className="w-full pl-9 pr-3 py-2 sm:py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5A6B]"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {[
                    { id: 'semua', label: 'Semua Status' },
                    { id: 'dikirim', label: 'Menunggu' },
                    { id: 'diperiksa', label: 'Diperiksa' },
                    { id: 'diproses', label: 'Diproses' },
                    { id: 'selesai', label: 'Selesai' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setComplaintStatus(btn.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                        complaintStatus === btn.id
                          ? 'bg-[#0F5A6B] text-white shadow-xs'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaints List Cards */}
              <div className="space-y-4">
                {loadingComplaints ? (
                  <div className="p-8 text-center text-gray-500 text-xs">Memuat daftar aduan warga...</div>
                ) : complaints.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs rounded-xl border border-gray-200 bg-gray-50">
                    Tidak ada aduan warga yang cocok dengan kriteria pencarian saat ini.
                  </div>
                ) : (
                  complaints.slice(0, 5).map((comp) => {
                    const st = complaintStatusMap[comp.status] || {
                      label: comp.status,
                      badge: 'bg-gray-100 text-gray-700 border-gray-300',
                      dot: 'bg-gray-400',
                    }
                    return (
                      <div
                        key={comp.id}
                        className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white hover:border-gray-300 transition space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#0F5A6B] bg-gray-100 px-2 py-0.5 rounded-md">
                              #{comp.kode}
                            </span>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {comp.kategori}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateShort(comp.created_at)} ({relativeTime(comp.created_at)})
                            </span>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.badge} self-start sm:self-auto shrink-0`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-[#26383D]">
                            {comp.judul}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {comp.deskripsi}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                          {comp.lokasi && (
                            <span className="inline-flex items-center gap-1 text-[#0F5A6B] font-medium">
                              <MapPin className="h-3.5 w-3.5 text-[#3CC4B0] shrink-0" />
                              Lokasi: {comp.lokasi}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            Pelapor: <strong className="text-gray-800">{comp.pelapor || 'Warga Terdaftar'}</strong>
                          </span>
                        </div>

                        {comp.tanggapan && (
                          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                            <p className="font-bold text-[#0F5A6B] inline-flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#3CC4B0]" />
                              Tanggapan Resmi Pengurus RT/RW:
                            </p>
                            <p className="text-gray-700 mt-1 leading-relaxed italic">
                              &ldquo;{comp.tanggapan}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VOTING ASPIRASI & PROGRAM */}
          {activeTab === 'voting' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-[#BFE3DA]/60 px-2.5 py-0.5 text-[11px] font-bold text-[#0F5A6B] border border-[#BFE3DA]">
                      Demokrasi Digital 1 KK 1 Suara
                    </span>
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                      View Only
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#0F5A6B]">
                    Musyawarah & Voting Program Prioritas Lingkungan
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Prioritaskan program lingkungan secara adil. Hasil suara langsung terhitung otomatis dari database tanpa manipulasi.
                  </p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <Link
                    to="/login"
                    className="rounded-lg bg-[#0F5A6B] text-white text-xs font-bold px-4 py-2.5 inline-flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#0c4756] transition w-full sm:w-auto"
                  >
                    Beri Suara KK Anda <ArrowRight className="h-3.5 w-3.5 text-[#F7B538]" />
                  </Link>
                </div>
              </div>

              {loadingVoting ? (
                <div className="p-8 text-center text-gray-500 text-xs">Memuat program voting lingkungan...</div>
              ) : (() => {
                const activeVotings = votings.filter((voting) => {
                  if (voting.status !== 'berjalan') return false
                  if (voting.deadline) {
                    const d = new Date(voting.deadline)
                    d.setHours(23, 59, 59, 999)
                    if (d.getTime() < Date.now()) return false
                  }
                  return true
                })

                if (activeVotings.length === 0) {
                  return (
                    <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 space-y-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-200 text-[#0F5A6B] grid place-items-center mx-auto">
                        <Vote className="h-6 w-6" />
                      </div>
                      <h4 className="text-base font-bold text-[#0F5A6B]">
                        Tidak Ada Voting yang Sedang Dibuka
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                        Saat ini tidak ada agenda musyawarah atau voting program yang sedang aktif. Agenda voting yang telah ditutup atau selesai tidak ditampilkan di landing page.
                      </p>
                    </div>
                  )
                }

                return activeVotings.map((voting) => (
                  <div key={voting.id} className="p-4 sm:p-6 rounded-2xl border border-gray-200 space-y-4 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Voting Sedang Berjalan
                        </span>
                        <h4 className="font-bold text-[#0F5A6B] text-sm sm:text-base mt-1.5">
                          {voting.judul}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5 max-w-xl leading-relaxed">
                          {voting.deskripsi}
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0 bg-white p-2.5 rounded-xl border border-gray-200 sm:border-0 sm:bg-transparent sm:p-0">
                        <p className="text-[11px] text-gray-400">Batas Waktu</p>
                        <p className="text-xs font-mono font-bold text-[#0F5A6B]">
                          {formatDate(voting.deadline)}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {voting.total_votes || 0} KK telah memilih
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {voting.options?.map((opt) => {
                        const totalVotes = voting.total_votes || 0
                        const percent = totalVotes > 0 ? Math.round(((opt.votes_count || 0) / totalVotes) * 100) : 0
                        return (
                          <div key={opt.id} className="p-3 sm:p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-4 text-xs font-bold text-[#26383D] mb-2">
                              <div className="min-w-0 flex-1">
                                <span className="break-words">{opt.nama}</span>
                                {opt.deskripsi && (
                                  <p className="text-[11px] text-gray-500 font-normal mt-0.5 break-words">{opt.deskripsi}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-[#0F5A6B] text-sm shrink-0 self-start sm:self-auto">
                                <span>{percent}%</span>
                                <span className="text-xs text-gray-400 font-normal">({opt.votes_count || 0} Suara)</span>
                              </div>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0F5A6B] rounded-full transition-all duration-700"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}

          {/* TAB 4: KEAMANAN & CCTV WARGA */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold px-2.5 py-0.5">
                      Proteksi Lingkungan 24 Jam
                    </span>
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                      Akses Publik (View Only)
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#0F5A6B]">
                    Pantauan CCTV Pos Kamling & Direktori Kontak Darurat
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Warga dapat memantau keamanan gerbang lingkungan secara real-time dan terhubung langsung ke aparat & kontak tanggap darurat RT/RW.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {cameras.filter(c => c.status === 'online').length} Titik Kamera Aktif
                  </span>
                </div>
              </div>

              {/* Main Command Deck */}
              <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left: CCTV Player & Camera Selector */}
                <div className="lg:col-span-7 space-y-3">
                  {cameras.length > 0 && (
                    <div className={`p-1.5 rounded-xl bg-gray-100 border border-gray-200 grid ${cameras.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
                      {cameras.map((cam, idx) => {
                        const isSelected = (selectedCameraId || cameras[0]?.id) === cam.id
                        const cleanName = cam.nama.replace(/\(.*\)/, '').trim()
                        return (
                          <button
                            key={cam.id}
                            onClick={() => setSelectedCameraId(cam.id)}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all truncate ${
                              isSelected
                                ? 'bg-[#0F5A6B] text-white shadow-sm'
                                : 'text-gray-700 hover:text-gray-950 hover:bg-white'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                cam.status === 'online' ? 'bg-[#3CC4B0] animate-pulse' : 'bg-rose-500'
                              }`}
                            />
                            <span className="truncate">
                              CAM {String(idx + 1).padStart(2, '0')} • {cleanName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {loadingSecurity ? (
                    <div className="aspect-video rounded-2xl bg-slate-900 flex items-center justify-center text-white/50 text-xs">
                      Memuat stream kamera lingkungan...
                    </div>
                  ) : cameras.length === 0 ? (
                    <div className="aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white/60 text-xs p-6 text-center">
                      <Camera className="h-8 w-8 text-white/30 mb-2" />
                      <p className="font-semibold text-white">Belum Ada Titik CCTV Dikonfigurasi</p>
                      <p className="text-[11px] text-white/40 mt-1">Pengurus RT/RW dapat menambahkan URL OBS stream di kontrol admin.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-md bg-slate-950 w-full">
                        {(() => {
                          const currentCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0]
                          return <CctvPlayer camera={currentCamera} />
                        })()}
                      </div>

                      {(() => {
                        const currentCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0]
                        return (
                          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Radio className="h-3.5 w-3.5 text-[#3CC4B0] animate-pulse shrink-0" />
                              <span className="text-[11px] text-gray-600 truncate">
                                Titik Pantau: <strong className="text-[#0F5A6B] font-bold">{currentCamera?.nama} ({currentCamera?.lokasi})</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                720p / 480p Eco Stream
                              </span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* Right: Emergency Contacts Hub */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                            <Siren className="h-5 w-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#0F5A6B] leading-tight">
                              Pusat Tanggap Darurat
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Kanal Siaga 24 Jam Terverifikasi</p>
                          </div>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          SOS Darurat
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                        Hubungi nomor resmi berikut jika menemukan kondisi darurat, insiden keamanan, atau butuh bantuan segera:
                      </p>

                      <div className="mt-3.5 space-y-2.5">
                        {contacts.length === 0 ? (
                          <div className="text-xs text-gray-400 py-6 text-center">
                            Memuat saluran kontak darurat...
                          </div>
                        ) : (
                          contacts.map((c) => {
                            const text = `${c.nama} ${c.peran} ${c.kategori}`.toLowerCase()
                            let IconComp = Users2
                            let badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            if (text.includes('keamanan') || text.includes('kamling') || text.includes('satpam')) {
                              IconComp = ShieldCheck
                              badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            } else if (text.includes('polisi') || text.includes('polsek') || text.includes('babinsa')) {
                              IconComp = ShieldAlert
                              badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200'
                            } else if (text.includes('damkar') || text.includes('kebakaran')) {
                              IconComp = Flame
                              badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200'
                            } else if (text.includes('medis') || text.includes('ambulans') || text.includes('dokter')) {
                              IconComp = HeartPulse
                              badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200'
                            }

                            return (
                              <div
                                key={c.id}
                                className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100 border border-gray-200 transition group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${badgeStyle}`}>
                                    <IconComp className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs sm:text-sm text-[#26383D] truncate leading-snug">
                                      {c.nama}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-gray-500 truncate capitalize">
                                        {c.peran}
                                      </span>
                                      <span className="text-gray-300">•</span>
                                      <span className="font-mono text-[10px] text-gray-600 font-medium truncate">
                                        {c.telepon}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <a
                                  href={`tel:${c.telepon.replace(/[^0-9+]/g, '')}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 shrink-0"
                                  title={`Hubungi ${c.nama}`}
                                >
                                  <PhoneCall className="h-3.5 w-3.5" />
                                  <span>Panggil</span>
                                </a>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 leading-relaxed">
                      <span>*Bebas pulsa nasional: <strong>110</strong> (Polisi) & <strong>119</strong> (Medis)</span>
                      <span className="text-emerald-700 font-medium">Terverifikasi RT/RW</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

