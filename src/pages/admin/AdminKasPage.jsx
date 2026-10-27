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
import PageBanner from '../../components/user/PageBanner'

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
    <div className="space-y-4 md:space-y-5">
      {/* Header Banner */}
      <PageBanner
        title="Buku Mutasi Kas Lingkungan RT/RW"
        subtitle="Pencatatan pengeluaran dan pemasukan kas lingkungan untuk transparansi terbuka kepada warga."
      />

      {/* KPI Balance Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Saldo Kas Bersih Saat Ini</span>
            <Wallet className="h-4 w-4 text-[#13B8A6]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#0F5A6B]">
            {formatRupiah(saldo)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Hasil akumulasi {transactions.length} mutasi kas tercatat
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Pemasukan Kas</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {formatRupiah(totalMasuk)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Termasuk iuran & sumbangan warga</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Pengeluaran Kas</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-600">
            {formatRupiah(totalKeluar)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Biaya operasional & pemeliharaan</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi atau kategori..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['semua', 'masuk', 'keluar'].map((jenis) => (
              <button
                key={jenis}
                onClick={() => setFilterJenis(jenis)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition shrink-0 ${
                  filterJenis === jenis
                    ? 'bg-[#13B8A6] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {jenis}
              </button>
            ))}
          </div>

          <button
            onClick={loadKas}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#F4B740] hover:bg-[#e0a430] text-xs font-bold text-[#26383D] inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Catat Kas Baru
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-[#E6F4F1] via-[#EEF8F6] to-[#E6F4F1] border-b border-slate-200 text-[#0F5A6B] font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Keterangan Transaksi</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5">Nominal</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
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
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(t.tanggal)}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">{t.keterangan}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono border border-slate-200">
                          {t.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            isMasuk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {t.jenis}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-mono font-bold ${
                          isMasuk ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isMasuk ? '+' : '-'} {formatRupiah(t.jumlah)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Mutasi</label>
              <select
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              >
                <option value="masuk">Pemasukan (+ Kas Masuk)</option>
                <option value="keluar">Pengeluaran (- Kas Keluar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Transaksi
            </label>
            <input
              type="text"
              required
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="contoh: Pembelian Lampu Sorot Pos Ronda Gang Mawar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#F4B740] hover:bg-[#e0a430] text-[#26383D] text-xs font-bold shadow-sm transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

