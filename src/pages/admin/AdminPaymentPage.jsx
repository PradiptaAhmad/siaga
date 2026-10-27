import { useState, useEffect } from 'react'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  FileText,
  User,
  ArrowRight,
  Plus,
} from 'lucide-react'
import api from '../../lib/api'
import { formatRupiah, formatDate } from '../../lib/format'
import { toastSuccess, showError, confirmAction } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import { getCached, setCached } from '../../lib/cache'
import Modal from '../../components/ui/Modal'
import PageBanner from '../../components/user/PageBanner'

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState([])
  const [statusFilter, setStatusFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Proof Modal
  const [inspectPayment, setInspectPayment] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Generate Iuran Modal
  const [genModalOpen, setGenModalOpen] = useState(false)
  const [genForm, setGenForm] = useState({
    periode: new Date().toISOString().slice(0, 7),
    judul: `Iuran Kebersihan & Keamanan ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
    jumlah: '150000',
    jatuh_tempo: `${new Date().toISOString().slice(0, 7)}-10`,
  })
  const [genSubmitting, setGenSubmitting] = useState(false)

  const handleGenerateIuran = async (e) => {
    e.preventDefault()
    setGenSubmitting(true)
    try {
      const res = await api.post('/admin/iuran/generate', genForm)
      toastSuccess(res.data.message || 'Tagihan iuran berhasil diterbitkan!')
      setGenModalOpen(false)
      loadPayments()
    } catch (err) {
      showError('Gagal Menerbitkan Tagihan', getErrorMessage(err))
    } finally {
      setGenSubmitting(false)
    }
  }

  const loadPayments = async (isBackground = false) => {
    if (!isBackground) {
      const cacheKey = `admin_payments_${statusFilter}`
      const cached = getCached(cacheKey)
      if (cached) {
        setPayments(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
    }

    try {
      const res = await api.get('/admin/payments', {
        params: { status: statusFilter },
      })
      const data = res.data.payments || []
      setPayments(data)
      setCached(`admin_payments_${statusFilter}`, data, 15000)
    } catch (err) {
      if (!isBackground) showError('Gagal Memuat Pembayaran', getErrorMessage(err))
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
    // Realtime polling setiap 6 detik
    const interval = setInterval(() => {
      loadPayments(true)
    }, 6000)
    return () => clearInterval(interval)
  }, [statusFilter])

  const handleVerify = async (payment, status, catatanAdmin = '') => {
    const isApprove = status === 'terverifikasi'
    const confirmed = await confirmAction({
      title: isApprove ? 'Verifikasi Pembayaran?' : 'Tolak Pembayaran Ini?',
      text: isApprove
        ? `Pembayaran ${formatRupiah(payment.jumlah)} dari ${payment.user?.name} akan disetujui, tagihan ditandai lunas, dan otomatis dibukukan ke Kas Masuk.`
        : `Pembayaran akan ditolak dan warga akan menerima notifikasi.`,
      confirmText: isApprove ? 'Ya, Verifikasi' : 'Tolak Pembayaran',
      danger: !isApprove,
    })
    if (!confirmed) return

    setActionLoading(true)
    try {
      await api.post(`/admin/payments/${payment.id}/verify`, {
        status,
        catatan_admin:
          catatanAdmin ||
          (isApprove
            ? 'Diverifikasi sah oleh Bendahara RT/RW'
            : 'Bukti transfer tidak valid atau belum masuk ke rekening kas.'),
      })
      toastSuccess(
        isApprove
          ? 'Pembayaran berhasil diverifikasi & dibukukan ke Kas!'
          : 'Pembayaran ditandai ditolak.'
      )
      setInspectPayment(null)
      loadPayments()
    } catch (err) {
      showError('Gagal Memproses Verifikasi', getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase()
    const nameMatch = p.user?.name?.toLowerCase().includes(term)
    const ketMatch = p.keterangan?.toLowerCase().includes(term)
    const invoiceMatch = p.nomor_pembayaran?.toLowerCase().includes(term)
    return nameMatch || ketMatch || invoiceMatch
  })

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header Banner */}
      <PageBanner
        title="Verifikasi Pembayaran Iuran & Tagihan Warga"
        subtitle="Periksa bukti transfer warga, setujui pelunasan iuran bulanan, atau terbitkan tagihan baru."
      />

      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama warga, invoice..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['semua', 'menunggu', 'terverifikasi', 'ditolak'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#13B8A6] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={loadPayments}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={() => setGenModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#F4B740] hover:bg-[#e0a430] text-xs font-bold text-[#26383D] inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Terbitkan Iuran
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-[#E6F4F1] via-[#EEF8F6] to-[#E6F4F1] border-b border-slate-200 text-[#0F5A6B] font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Invoice & Tanggal</th>
                <th className="px-5 py-3.5">Nama Warga</th>
                <th className="px-5 py-3.5">Keterangan</th>
                <th className="px-5 py-3.5">Jumlah</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    Tidak ada transaksi pembayaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono">
                        <span className="font-bold text-slate-800 block">
                          {p.nomor_pembayaran || `INV-${p.id}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(p.created_at)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-800 grid place-items-center font-bold text-xs">
                            {p.user?.name?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{p.user?.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              RT {p.user?.rt || '004'} / RW {p.user?.rw || '002'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="block text-slate-800 font-medium">{p.keterangan}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Metode: {p.metode_pembayaran || 'Transfer Bank'}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-[#0F5A6B]">
                        {formatRupiah(p.jumlah)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase inline-block ${
                            p.status === 'terverifikasi'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'ditolak'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectPayment(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                            title="Buka Rincian & Bukti"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" /> Bukti
                          </button>

                          {p.status === 'menunggu' && (
                            <>
                              <button
                                onClick={() => handleVerify(p, 'terverifikasi')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 transition shadow-sm"
                                title="Setujui Pembayaran"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Setujui
                              </button>
                              <button
                                onClick={() => handleVerify(p, 'ditolak')}
                                className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition border border-rose-200"
                                title="Tolak"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT PAYMENT & PROOF MODAL */}
      <Modal
        open={Boolean(inspectPayment)}
        onClose={() => setInspectPayment(null)}
        title={`Rincian Transaksi: ${inspectPayment?.nomor_pembayaran || ''}`}
        description="Periksa bukti transfer dan status pembayaran kas dari warga."
        size="lg"
      >
        {inspectPayment && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Warga Pembayar:
                </span>
                <span className="font-bold text-slate-900 text-sm">{inspectPayment.user?.name}</span>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  KK: {inspectPayment.user?.no_kk || '-'} • RT {inspectPayment.user?.rt || '004'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Nominal Pembayaran:
                </span>
                <span className="font-extrabold text-[#0F5A6B] text-base font-mono">
                  {formatRupiah(inspectPayment.jumlah)}
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">{inspectPayment.keterangan}</p>
              </div>
            </div>

            {/* Proof Image / Document View */}
            <div>
              <span className="text-xs font-bold text-slate-700 mb-2 block">
                Lampiran Bukti Transfer / Resi Bank:
              </span>
              {inspectPayment.bukti_transfer ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 text-center">
                  <img
                    src={
                      inspectPayment.bukti_transfer.startsWith('http')
                        ? inspectPayment.bukti_transfer
                        : `/storage/${inspectPayment.bukti_transfer}`
                    }
                    alt="Bukti Transfer"
                    className="max-h-80 mx-auto rounded-lg object-contain shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src =
                        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
                    }}
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  Warga tidak melampirkan foto resi fisik (Pembayaran Tunai / Otomatis).
                </div>
              )}
            </div>

            {inspectPayment.catatan_admin && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Catatan Admin Sebelumnya:
                </span>
                <p className="text-slate-800 mt-0.5 italic">{inspectPayment.catatan_admin}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase font-bold ${
                  inspectPayment.status === 'terverifikasi'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : inspectPayment.status === 'ditolak'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                Status: {inspectPayment.status}
              </span>

              <div className="flex items-center gap-2">
                {inspectPayment.status === 'menunggu' && (
                  <>
                    <button
                      onClick={() => handleVerify(inspectPayment, 'ditolak')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold transition"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleVerify(inspectPayment, 'terverifikasi')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      Verifikasi & Buku ke Kas
                    </button>
                  </>
                )}
                <button
                  onClick={() => setInspectPayment(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: GENERATE TAGIHAN IURAN WARGA */}
      <Modal
        open={genModalOpen}
        onClose={() => setGenModalOpen(false)}
        title="Terbitkan Tagihan Iuran Bulanan Baru"
        description="Tagihan akan otomatis dikirimkan ke seluruh kepala keluarga (KK) aktif di lingkungan RT."
        size="md"
      >
        <form onSubmit={handleGenerateIuran} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Periode Bulan (YYYY-MM)
              </label>
              <input
                type="text"
                required
                pattern="\d{4}-\d{2}"
                value={genForm.periode}
                onChange={(e) => setGenForm({ ...genForm, periode: e.target.value })}
                placeholder="contoh: 2026-11"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
              <input
                type="date"
                required
                value={genForm.jatuh_tempo}
                onChange={(e) => setGenForm({ ...genForm, jatuh_tempo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Uraian Iuran</label>
            <input
              type="text"
              required
              value={genForm.judul}
              onChange={(e) => setGenForm({ ...genForm, judul: e.target.value })}
              placeholder="contoh: Iuran Kebersihan & Keamanan November 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal per Kepala Keluarga (Rp)
            </label>
            <input
              type="number"
              required
              min="1000"
              step="1000"
              value={genForm.jumlah}
              onChange={(e) => setGenForm({ ...genForm, jumlah: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setGenModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={genSubmitting}
              className="px-4 py-2 rounded-xl bg-[#F4B740] hover:bg-[#e0a430] text-[#26383D] text-xs font-bold shadow-sm transition"
            >
              {genSubmitting ? 'Menerbitkan...' : 'Terbitkan Tagihan Iuran'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

