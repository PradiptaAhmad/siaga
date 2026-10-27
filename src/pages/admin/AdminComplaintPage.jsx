import { useState, useEffect } from 'react'
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Send,
  User,
  MapPin,
  Calendar,
} from 'lucide-react'
import api from '../../lib/api'
import { formatDate } from '../../lib/format'
import { toastSuccess, showError } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import { getCached, setCached } from '../../lib/cache'
import Modal from '../../components/ui/Modal'
import PageBanner from '../../components/user/PageBanner'

export default function AdminComplaintPage() {
  const [complaints, setComplaints] = useState([])
  const [statusFilter, setStatusFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Status Update Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [newStatus, setNewStatus] = useState('diproses')
  const [adminNote, setAdminNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComplaints = async (isBackground = false) => {
    if (!isBackground) {
      const cacheKey = `admin_complaints_${statusFilter}`
      const cached = getCached(cacheKey)
      if (cached) {
        setComplaints(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
    }

    try {
      const res = await api.get('/admin/complaints', {
        params: { status: statusFilter },
      })
      const data = res.data.complaints || []
      setComplaints(data)
      setCached(`admin_complaints_${statusFilter}`, data, 15000)
    } catch (err) {
      if (!isBackground) showError('Gagal Mengambil Aduan', getErrorMessage(err))
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
    // Realtime background polling setiap 6 detik
    const interval = setInterval(() => {
      loadComplaints(true)
    }, 6000)
    return () => clearInterval(interval)
  }, [statusFilter])

  const handleOpenUpdate = (complaint) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status || 'diproses')
    setAdminNote('')
  }

  const handleSaveStatus = async (e) => {
    e.preventDefault()
    if (!adminNote) {
      showError('Form Belum Lengkap', 'Tuliskan catatan tindak lanjut atau tanggapan untuk warga.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        catatan: adminNote,
      })
      toastSuccess('Status aduan dan kronologi berhasil diperbarui!')
      setSelectedComplaint(null)
      loadComplaints()
    } catch (err) {
      showError('Gagal Memperbarui Status', getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = complaints.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.judul?.toLowerCase().includes(term) ||
      c.kategori?.toLowerCase().includes(term) ||
      c.user?.name?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header Banner */}
      <PageBanner
        title="Tindak Lanjut Aduan & Permohonan Warga"
        subtitle="Tanggapi laporan kendala lingkungan warga, perbarui status investigasi, dan catat riwayat solusi."
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul aduan, nama warga..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {['semua', 'dikirim', 'diperiksa', 'diproses', 'selesai', 'ditolak'].map((st) => (
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
            onClick={loadComplaints}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Complaints List Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
            Tidak ada laporan aduan warga yang cocok.
          </div>
        ) : (
          filtered.map((c) => {
            return (
              <div
                key={c.id}
                className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-[#13B8A6] transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-[#0F5A6B] border border-teal-200/70 uppercase">
                      {c.kategori}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        c.status === 'selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'diproses'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : c.status === 'ditolak'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {c.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-2.5">{c.judul}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {c.deskripsi}
                  </p>

                  {/* Citizen Info & Meta */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <User className="h-3 w-3 text-teal-600" /> {c.user?.name}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3 text-slate-400" /> RT {c.user?.rt || '004'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(c.created_at)}
                    </span>
                  </div>

                  {c.tanggapan && (
                    <div className="mt-3 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs">
                      <span className="text-[10px] uppercase font-mono text-[#0F5A6B] font-semibold block">
                        Tanggapan RT/RW Terakhir:
                      </span>
                      <p className="text-slate-700 mt-0.5 italic">{c.tanggapan}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    TIKET #{String(c.id).padStart(4, '0')}
                  </span>
                  <button
                    onClick={() => handleOpenUpdate(c)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F4B740] hover:bg-[#e0a430] text-[#26383D] text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                  >
                    Tindak Lanjut & Respon
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL: UPDATE COMPLAINT STATUS */}
      <Modal
        open={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        title={`Tindak Lanjut Aduan: ${selectedComplaint?.judul || ''}`}
        description="Perbarui status penyelesaian dan berikan catatan resmi tindak lanjut untuk pelapor."
        size="lg"
      >
        {selectedComplaint && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">
                Laporan dari Warga:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedComplaint.judul}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{selectedComplaint.deskripsi}</p>
              <p className="text-slate-500 text-[11px] font-mono mt-2">
                Pelapor: {selectedComplaint.user?.name} (RT {selectedComplaint.user?.rt || '004'})
              </p>
            </div>

            {/* Photos if any */}
            {selectedComplaint.foto && (
              <div>
                <span className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Foto / Bukti Lapangan:
                </span>
                <img
                  src={
                    selectedComplaint.foto.startsWith('http')
                      ? selectedComplaint.foto
                      : `/storage/${selectedComplaint.foto}`
                  }
                  alt="Bukti Aduan"
                  className="max-h-48 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Status Penyelesaian Baru
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              >
                <option value="diperiksa">Diperiksa (Sedang ditinjau oleh pengurus)</option>
                <option value="diproses">Diproses (Sedang dalam pengerjaan teknis)</option>
                <option value="selesai">Selesai (Masalah telah tuntas ditangani)</option>
                <option value="ditolak">Ditolak (Di luar wewenang RT atau tidak valid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Tindak Lanjut / Kronologi Resmi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="contoh: Pengurus RT telah meninjau lokasi dan berkoordinasi dengan petugas perbaikan saluran air..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
            </div>

            {/* Previous History Timeline */}
            {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
                  Riwayat Progres Sebelumnya:
                </span>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {selectedComplaint.updates.map((up) => (
                    <div key={up.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-teal-600">
                          {up.status}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatDate(up.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{up.catatan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#F4B740] hover:bg-[#e0a430] text-[#26383D] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Menyimpan...' : 'Kirim Pembaruan Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

