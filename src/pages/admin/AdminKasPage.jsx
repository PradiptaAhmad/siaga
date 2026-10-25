import { useState, useEffect } from 'react'
import {
  Receipt,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import api from '../../lib/api'
import { formatRupiah, formatDate } from '../../lib/format'
import { toastSuccess, showError, confirmAction } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import { getCached, setCached } from '../../lib/cache'
import Modal from '../../components/ui/Modal'

export default function AdminKasPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('semua')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    kategori: 'Perbaikan Fasilitas',
    jenis: 'masuk',
    jumlah: '',
  })
  const [saving, setSaving] = useState(false)

  const loadKas = async (isBackground = false) => {
    if (!isBackground) {
      const cached = getCached('admin_kas')
      if (cached) {
        setTransactions(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
    }

    try {
      const res = await api.get('/admin/kas')
      const data = res.data.transactions || []
      setTransactions(data)
      setCached('admin_kas', data, 20000)
    } catch (err) {
      if (!isBackground) showError('Gagal Mengambil Data Kas', getErrorMessage(err))
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    loadKas()
    // Realtime polling setiap 6 detik
    const interval = setInterval(() => {
      loadKas(true)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.keterangan || !form.jumlah) {
      showError('Form Belum Lengkap', 'Keterangan dan nominal transaksi wajib diisi.')
      return
    }

    setSaving(true)
    try {
      await api.post('/admin/kas', form)
      toastSuccess('Transaksi kas berhasil dicatat.')
      setModalOpen(false)
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        kategori: 'Perbaikan Fasilitas',
        jenis: 'masuk',
        jumlah: '',
      })
      loadKas()
    } catch (err) {
      showError('Gagal Menyimpan Transaksi', getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (trx) => {
    const confirmed = await confirmAction({
      title: 'Hapus Transaksi Kas?',
      text: `Transaksi "${trx.keterangan}" sebesar ${formatRupiah(trx.jumlah)} akan dihapus permanen.`,
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(`/admin/kas/${trx.id}`)
      toastSuccess('Transaksi kas berhasil dihapus.')
      loadKas()
    } catch (err) {
      showError('Gagal Menghapus Transaksi', getErrorMessage(err))
    }
  }

  // Calculations
  const totalMasuk = transactions
    .filter((t) => t.jenis === 'masuk')
    .reduce((acc, t) => acc + Number(t.jumlah), 0)
  const totalKeluar = transactions
    .filter((t) => t.jenis === 'keluar')
    .reduce((acc, t) => acc + Number(t.jumlah), 0)
  const saldo = totalMasuk - totalKeluar

  const filtered = transactions.filter((t) => {
    const term = search.toLowerCase()
    const ketMatch = t.keterangan?.toLowerCase().includes(term)
    const katMatch = t.kategori?.toLowerCase().includes(term)
    const matchJenis = filterJenis === 'semua' || t.jenis === filterJenis
    return (ketMatch || katMatch) && matchJenis
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Transparansi Finansial RT/RW
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Buku Mutasi Kas Lingkungan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Catat pengeluaran dan pemasukan kas lingkungan untuk pertanggungjawaban terbuka kepada warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadKas}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white inline-flex items-center gap-1.5 transition border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="h-4 w-4" /> Catat Transaksi Baru
          </button>
        </div>
      </div>

      {/* KPI Balance Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/70 border border-indigo-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saldo Kas Bersih Saat Ini</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {formatRupiah(saldo)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Hasil akumulasi {transactions.length} mutasi kas
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Pemasukan Kas</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {formatRupiah(totalMasuk)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Termasuk iuran & sumbangan warga</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Pengeluaran Kas</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {formatRupiah(totalKeluar)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Biaya operasional, keamanan & pemeliharaan</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi atau kategori..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['semua', 'masuk', 'keluar'].map((jenis) => (
            <button
              key={jenis}
              onClick={() => setFilterJenis(jenis)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition ${
                filterJenis === jenis
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {jenis}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Keterangan Transaksi</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5">Nominal</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    Tidak ada mutasi kas yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isMasuk = t.jenis === 'masuk'
                  return (
                    <tr key={t.id} className="hover:bg-white/5 transition">
                      <td className="px-5 py-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(t.tanggal)}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">{t.keterangan}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-mono">
                          {t.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            isMasuk
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {t.jenis}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-mono font-bold ${
                          isMasuk ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isMasuk ? '+' : '-'} {formatRupiah(t.jumlah)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD TRANSACTION */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Catat Mutasi Kas Baru"
        description="Masukkan pengeluaran atau pemasukan baru ke buku kas lingkungan."
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Jenis Mutasi</label>
              <select
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="masuk">Pemasukan (+ Kas Masuk)</option>
                <option value="keluar">Pengeluaran (- Kas Keluar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Keterangan Transaksi
            </label>
            <input
              type="text"
              required
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="contoh: Pembelian Lampu Sorot Pos Ronda Gang Mawar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Iuran Warga">Iuran Warga</option>
                <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                <option value="Perbaikan Fasilitas">Perbaikan Fasilitas</option>
                <option value="Keamanan & Ronda">Keamanan & Ronda</option>
                <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                <option value="Kegiatan & Sosial">Kegiatan & Sosial</option>
                <option value="Administrasi">Administrasi & ATK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Nominal (Rupiah)
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                placeholder="contoh: 250000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              {saving ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

