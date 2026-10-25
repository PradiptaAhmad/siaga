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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Pelayanan Warga & Aspirasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Tindak Lanjut Aduan & Permohonan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tanggapi laporan kendala lingkungan warga, perbarui status investigasi, dan catat riwayat solusi.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white inline-flex items-center gap-1.5 transition border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul aduan, nama warga..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['semua', 'dikirim', 'diperiksa', 'diproses', 'selesai', 'ditolak'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl bg-slate-900 border border-white/10 p-12 text-center text-slate-400 text-xs">
            Tidak ada laporan aduan warga yang cocok.
          </div>
        ) : (
          filtered.map((c) => {
            return (
              <div
                key={c.id}
                className="rounded-2xl bg-slate-900 border border-white/10 p-5 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300 uppercase">
                      {c.kategori}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        c.status === 'selesai'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'diproses'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : c.status === 'ditolak'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      ● {c.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">{c.judul}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {c.deskripsi}
                  </p>

                  {/* Citizen Info & Meta */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <User className="h-3 w-3 text-indigo-400" /> {c.user?.name}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3 text-slate-500" /> RT {c.user?.rt || '004'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="h-3 w-3 text-slate-500" /> {formatDate(c.created_at)}
                    </span>
                  </div>

                  {c.tanggapan && (
                    <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
                      <span className="text-[10px] uppercase font-mono text-indigo-300 font-semibold block">
                        Tanggapan RT/RW Terakhir:
                      </span>
                      <p className="text-slate-200 mt-0.5 italic">{c.tanggapan}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    TIKET #{String(c.id).padStart(4, '0')}
                  </span>
                  <button
                    onClick={() => handleOpenUpdate(c)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow"
                  >
                    Tindak Lanjut & Update Status
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
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Laporan dari Warga:
              </span>
              <p className="font-bold text-white text-sm mt-0.5">{selectedComplaint.judul}</p>
              <p className="text-slate-300 mt-1 leading-relaxed">{selectedComplaint.deskripsi}</p>
              <p className="text-slate-400 text-[11px] font-mono mt-2">
                Pelapor: {selectedComplaint.user?.name} (RT {selectedComplaint.user?.rt || '004'})
              </p>
            </div>

            {/* Photos if any */}
            {selectedComplaint.foto && (
              <div>
                <span className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Foto / Bukti Lapangan:
                </span>
                <img
                  src={
                    selectedComplaint.foto.startsWith('http')
                      ? selectedComplaint.foto
                      : `/storage/${selectedComplaint.foto}`
                  }
                  alt="Bukti Aduan"
                  className="max-h-48 rounded-xl border border-white/10 object-cover"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Pilih Status Penyelesaian Baru
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="diperiksa">Diperiksa (Sedang ditinjau oleh pengurus)</option>
                <option value="diproses">Diproses (Sedang dalam pengerjaan teknis)</option>
                <option value="selesai">Selesai (Masalah telah tuntas ditangani)</option>
                <option value="ditolak">Ditolak (Di luar wewenang RT atau tidak valid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Catatan Tindak Lanjut / Kronologi Resmi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="contoh: Pengurus RT telah meninjau lokasi dan berkoordinasi dengan petugas perbaikan saluran air..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Previous History Timeline */}
            {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                  Riwayat Progres Sebelumnya:
                </span>
                <div className="space-y-2 border-l-2 border-white/10 pl-3">
                  {selectedComplaint.updates.map((up) => (
                    <div key={up.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-indigo-400">
                          {up.status}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {formatDate(up.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{up.catatan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
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

