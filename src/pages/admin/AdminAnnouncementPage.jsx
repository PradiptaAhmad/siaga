import { useState, useEffect } from 'react'
import {
  Bell,
  Plus,
  Trash2,
  Pin,
  Calendar,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react'
import api from '../../lib/api'
import { formatDate } from '../../lib/format'
import { toastSuccess, showError, confirmAction } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import PageBanner from '../../components/user/PageBanner'

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    judul: '',
    kategori: 'Rapat Warga',
    ringkasan: '',
    isi: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'Balai Warga RW 002',
    pinned: false,
  })
  const [submitting, setSubmitting] = useState(false)

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await api.get('/announcements')
      setAnnouncements(res.data.announcements || [])
    } catch (err) {
      showError('Gagal Memuat Pengumuman', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.judul || !form.isi) {
      showError('Form Belum Lengkap', 'Judul dan isi pengumuman wajib diisi.')
      return
    }

    // Peringatan jika tanggal & hari yang sama sudah ada pengumuman
    const sameDayList = announcements.filter(
      (a) => a.tanggal && a.tanggal.split('T')[0] === form.tanggal
    )
    if (sameDayList.length > 0) {
      const confirmed = await confirmAction({
        title: 'Peringatan: Jadwal Tanggal Sama!',
        text: `Sudah terdapat ${sameDayList.length} pengumuman terdaftar pada tanggal ${formatDate(
          form.tanggal
        )} (Contoh: "${sameDayList[0].judul}"). Apakah Anda yakin ingin tetap menerbitkan pengumuman baru pada tanggal yang sama?`,
        confirmText: 'Ya, Tetap Terbitkan',
        cancelText: 'Periksa Kembali',
        danger: false,
      })
      if (!confirmed) return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        ringkasan: form.ringkasan.trim() || form.isi.slice(0, 120),
      }
      await api.post('/admin/announcements', payload)
      toastSuccess('Pengumuman berhasil diterbitkan dan disiarkan ke warga!')
      setModalOpen(false)
      setForm({
        judul: '',
        kategori: 'Rapat Warga',
        ringkasan: '',
        isi: '',
        tanggal: new Date().toISOString().split('T')[0],
        lokasi: 'Balai Warga RW 002',
        pinned: false,
      })
      loadAnnouncements()
    } catch (err) {
      showError('Gagal Menerbitkan Pengumuman', getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (ann) => {
    const confirmed = await confirmAction({
      title: 'Hapus Pengumuman Ini?',
      text: `Pengumuman "${ann.judul}" akan dihapus dari papan informasi warga.`,
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return
    try {
      await api.delete(`/admin/announcements/${ann.id}`)
      toastSuccess('Pengumuman berhasil dihapus.')
      loadAnnouncements()
    } catch (err) {
      showError('Gagal Menghapus', getErrorMessage(err))
    }
  }

  const filtered = announcements.filter((a) => {
    const term = search.toLowerCase()
    return (
      a.judul?.toLowerCase().includes(term) ||
      a.kategori?.toLowerCase().includes(term) ||
      a.isi?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <PageBanner
        title="Pengumuman & Pemberitahuan Resmi Lingkungan"
        subtitle="Terbitkan surat edaran, jadwal kegiatan gotong royong, posyandu, dan agenda resmi warga RT 04 / RW 02."
      />

      {/* Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari arsip pengumuman..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnnouncements}
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
            <Plus className="h-4 w-4" /> Terbitkan Pengumuman
          </button>
        </div>
      </div>

      {/* Announcement Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition shadow-sm ${
              a.pinned
                ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                : 'bg-white border-slate-200 hover:border-[#13B8A6]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-[#0F5A6B] border border-teal-200/70">
                  {a.kategori}
                </span>
                {a.pinned && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Pin className="h-3 w-3 fill-amber-700" /> Disematkan
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-2.5">{a.judul}</h3>
              {a.ringkasan && (
                <p className="text-xs text-[#0F5A6B] mt-1 font-medium">{a.ringkasan}</p>
              )}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {a.isi}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(a.tanggal)}
                </span>
                {a.lokasi && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> {a.lokasi}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                PENULIS: {a.penulis || 'Pengurus RT/RW'}
              </span>
              <button
                onClick={() => handleDelete(a)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold inline-flex items-center gap-1 transition border border-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CREATE ANNOUNCEMENT */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Terbitkan Pengumuman Resmi Warga"
        description="Pemberitahuan akan tampil langsung di halaman utama dan notifikasi seluruh warga."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Judul Pengumuman <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="contoh: Jadwal Kerja Bakti & Fogging Nyamuk DBD RT 004"
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
                <option value="Rapat Warga">Rapat Warga</option>
                <option value="Kerja Bakti">Kerja Bakti</option>
                <option value="Iuran & Kas">Iuran & Kas</option>
                <option value="Keamanan Lingkungan">Keamanan Lingkungan</option>
                <option value="Acara Sosial & Hari Besar">Acara Sosial & Hari Besar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Tanggal Terbit / Kegiatan
              </label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Lokasi Kegiatan (Opsional)
            </label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="contoh: Balai Pertemuan Warga / Lapangan Serbaguna"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Ringkasan Singkat (Lead Text)
            </label>
            <input
              type="text"
              value={form.ringkasan}
              onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
              placeholder="contoh: Diharapkan seluruh kepala keluarga hadir membawa alat kebersihan masing-masing."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Isi Lengkap Pengumuman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.isi}
              onChange={(e) => setForm({ ...form, isi: e.target.value })}
              placeholder="Tuliskan isi pengumuman lengkap secara rinci..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="h-4 w-4 rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="pinned" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Sematkan pengumuman ini di urutan paling atas (Pinned Announcement)
            </label>
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
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              {submitting ? 'Menerbitkan...' : 'Terbitkan Sekarang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

