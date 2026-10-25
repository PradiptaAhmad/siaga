import { useState, useEffect } from 'react'
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Phone,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Radio,
} from 'lucide-react'
import api from '../../lib/api'
import { toastSuccess, showError, confirmAction } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import CctvPlayer from '../../components/security/CctvPlayer'

export default function AdminCctvPage() {
  const [cameras, setCameras] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  // Camera Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState(null)
  const [camForm, setCamForm] = useState({
    nama: '',
    lokasi: '',
    status: 'online',
    akses_diizinkan: true,
    stream_url: '',
    keterangan: '',
  })
  const [savingCam, setSavingCam] = useState(false)

  // Test Stream Preview in Modal
  const [previewStream, setPreviewStream] = useState(false)

  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [contactForm, setContactForm] = useState({
    nama: '',
    peran: '',
    telepon: '',
    kategori: 'lingkungan',
    urutan: 1,
  })
  const [savingContact, setSavingContact] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [resCam, resContact] = await Promise.all([
        api.get('/admin/cameras'),
        api.get('/admin/contacts'),
      ])
      setCameras(resCam.data.cameras || [])
      setContacts(resContact.data.contacts || [])
    } catch (err) {
      console.error(err)
      showError('Gagal Mengambil Data', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // CCTV Handlers
  const handleOpenAddCamera = () => {
    setEditingCamera(null)
    setCamForm({
      nama: '',
      lokasi: '',
      status: 'online',
      akses_diizinkan: true,
      stream_url: '',
      keterangan: '',
    })
    setPreviewStream(false)
    setCameraModalOpen(true)
  }

  const handleOpenEditCamera = (cam) => {
    setEditingCamera(cam)
    setCamForm({
      nama: cam.nama,
      lokasi: cam.lokasi,
      status: cam.status,
      akses_diizinkan: Boolean(cam.akses_diizinkan),
      stream_url: cam.stream_url || '',
      keterangan: cam.keterangan || '',
    })
    setPreviewStream(Boolean(cam.stream_url))
    setCameraModalOpen(true)
  }

  const handleSaveCamera = async (e) => {
    e.preventDefault()
    if (!camForm.nama || !camForm.lokasi) {
      showError('Validasi Gagal', 'Nama dan lokasi kamera wajib diisi.')
      return
    }

    setSavingCam(true)
    try {
      if (editingCamera) {
        await api.put(`/admin/cameras/${editingCamera.id}`, camForm)
        toastSuccess('Data kamera CCTV berhasil diperbarui.')
      } else {
        await api.post('/admin/cameras', camForm)
        toastSuccess('Kamera CCTV baru berhasil ditambahkan.')
      }
      setCameraModalOpen(false)
      loadData()
    } catch (err) {
      showError('Gagal Menyimpan Kamera', getErrorMessage(err))
    } finally {
      setSavingCam(false)
    }
  }

  const handleDeleteCamera = async (cam) => {
    const confirmed = await confirmAction({
      title: `Hapus Kamera ${cam.nama}?`,
      text: 'Titik kamera ini tidak akan lagi tampil di pantauan keamanan warga.',
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(`/admin/cameras/${cam.id}`)
      toastSuccess('Kamera berhasil dihapus.')
      loadData()
    } catch (err) {
      showError('Gagal Menghapus Kamera', getErrorMessage(err))
    }
  }

  const handleToggleCamStatus = async (cam) => {
    const newStatus = cam.status === 'online' ? 'offline' : 'online'
    try {
      await api.put(`/admin/cameras/${cam.id}`, {
        ...cam,
        status: newStatus,
        akses_diizinkan: Boolean(cam.akses_diizinkan),
      })
      toastSuccess(`Kamera ${cam.nama} sekarang ${newStatus.toUpperCase()}`)
      loadData()
    } catch (err) {
      showError('Gagal Mengubah Status', getErrorMessage(err))
    }
  }

  const handleToggleCamAccess = async (cam) => {
    const newAccess = !cam.akses_diizinkan
    try {
      await api.put(`/admin/cameras/${cam.id}`, {
        ...cam,
        akses_diizinkan: newAccess,
      })
      toastSuccess(
        newAccess
          ? `Akses ${cam.nama} dibuka untuk seluruh warga.`
          : `Akses ${cam.nama} dibatasi hanya untuk pengurus.`
      )
      loadData()
    } catch (err) {
      showError('Gagal Mengubah Izin Akses', getErrorMessage(err))
    }
  }

  // Emergency Contact Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null)
    setContactForm({
      nama: '',
      peran: '',
      telepon: '',
      kategori: 'lingkungan',
      urutan: contacts.length + 1,
    })
    setContactModalOpen(true)
  }

  const handleOpenEditContact = (c) => {
    setEditingContact(c)
    setContactForm({
      nama: c.nama,
      peran: c.peran,
      telepon: c.telepon,
      kategori: c.kategori || 'lingkungan',
      urutan: c.urutan || 1,
    })
    setContactModalOpen(true)
  }

  const handleSaveContact = async (e) => {
    e.preventDefault()
    if (!contactForm.nama || !contactForm.telepon) {
      showError('Validasi Gagal', 'Nama kontak dan nomor telepon wajib diisi.')
      return
    }

    setSavingContact(true)
    try {
      if (editingContact) {
        await api.put(`/admin/contacts/${editingContact.id}`, contactForm)
        toastSuccess('Kontak darurat berhasil diperbarui.')
      } else {
        await api.post('/admin/contacts', contactForm)
        toastSuccess('Kontak darurat baru berhasil ditambahkan.')
      }
      setContactModalOpen(false)
      loadData()
    } catch (err) {
      showError('Gagal Menyimpan Kontak', getErrorMessage(err))
    } finally {
      setSavingContact(false)
    }
  }

  const handleDeleteContact = async (c) => {
    const confirmed = await confirmAction({
      title: `Hapus Kontak ${c.nama}?`,
      text: 'Kontak ini akan dihapus dari daftar hotline darurat warga.',
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(`/admin/contacts/${c.id}`)
      toastSuccess('Kontak berhasil dihapus.')
      loadData()
    } catch (err) {
      showError('Gagal Menghapus Kontak', getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Keamanan & Pemantauan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Manajemen Kamera CCTV & Kontak Darurat
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasikan streaming video VDO.Ninja/YouTube, kendali izin akses warga, dan nomor darurat 24 jam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white inline-flex items-center gap-1.5 transition border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <button
            onClick={handleOpenAddCamera}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="h-4 w-4" /> Tambah Titik CCTV
          </button>
        </div>
      </div>

      {/* VDO.Ninja & Stream Guidance Callout */}
      <div className="p-5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Dukungan Stream URL Eksternal (VDO.Ninja, YouTube Live, dsb.)
            </h3>
            <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
              SIAGA mendukung streaming instan tanpa server tambahan! Anda dapat menggunakan smartphone atau webcam sebagai CCTV via{' '}
              <strong className="text-amber-300">VDO.Ninja</strong> (tautan format{' '}
              <code className="bg-black/30 px-1 py-0.5 rounded text-white font-mono text-[11px]">
                https://vdo.ninja/?view=ROOM_ID
              </code>
              ) atau streaming YouTube Live.
            </p>
          </div>
        </div>
        <a
          href="https://vdo.ninja"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition border border-white/15"
        >
          Buka VDO.Ninja <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* CCTV Cameras Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Daftar Kamera CCTV Lingkungan</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-300">
              {cameras.length} Titik
            </span>
          </div>
        </div>

        {cameras.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 border border-white/10 p-12 text-center">
            <Camera className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Belum Ada Titik Kamera</h3>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol &quot;Tambah Titik CCTV&quot; di atas untuk mendaftarkan kamera pertama.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cameras.map((cam) => {
              const isOnline = cam.status === 'online'
              const isAllowed = cam.akses_diizinkan
              return (
                <div
                  key={cam.id}
                  className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  {/* Live Feed Video Preview */}
                  <div className="p-3 bg-slate-950">
                    <CctvPlayer camera={cam} />
                  </div>

                  {/* Body & Controls */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white">{cam.nama}</h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleCamStatus(cam)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition ${
                              isOnline
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                            title="Klik untuk ubah status online/offline"
                          >
                            ● {cam.status}
                          </button>
                          <button
                            onClick={() => handleToggleCamAccess(cam)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                              isAllowed
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                            title="Klik untuk ubah izin akses warga"
                          >
                            {isAllowed ? 'AKSES WARGA: YA' : 'TERBATAS PENGURUS'}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Lokasi: <span className="text-slate-300">{cam.lokasi}</span>
                      </p>

                      {/* Stream URL display */}
                      <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                          Resource Stream URL:
                        </span>
                        <div className="truncate text-indigo-300 mt-0.5">
                          {cam.stream_url ? (
                            <a
                              href={cam.stream_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              {cam.stream_url} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-500 italic">
                              Tidak ada URL (Mode Simulasi Standby)
                            </span>
                          )}
                        </div>
                      </div>

                      {cam.keterangan && (
                        <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
                          &quot;{cam.keterangan}&quot;
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: CAM_{String(cam.id).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditCamera(cam)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCamera(cam)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Emergency Contacts Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-500" />
            <div>
              <h2 className="text-lg font-bold text-white">Kontak Darurat & Hotline RT/RW</h2>
              <p className="text-xs text-slate-400">
                Nomor bantuan darurat dan pos ronda yang dapat dihubungi warga melalui telepon / WhatsApp.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddContact}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white inline-flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Tambah Kontak Darurat
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">{c.nama}</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono">
                    #{c.urutan}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.peran}</p>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{c.telepon}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEditContact(c)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Edit Kontak"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteContact(c)}
                  className="p-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 transition"
                  title="Hapus Kontak"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD / EDIT CCTV CAMERA */}
      <Modal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        title={editingCamera ? `Edit CCTV: ${editingCamera.nama}` : 'Tambah Titik CCTV Baru'}
        description="Atur nama, lokasi fisik, status online, serta tautan video stream VDO.Ninja atau YouTube."
        size="lg"
      >
        <form onSubmit={handleSaveCamera} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Nama Kamera <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={camForm.nama}
                onChange={(e) => setCamForm({ ...camForm, nama: e.target.value })}
                placeholder="contoh: CCTV Gerbang Barat"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Lokasi Fisik Titik Kamera <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={camForm.lokasi}
                onChange={(e) => setCamForm({ ...camForm, lokasi: e.target.value })}
                placeholder="contoh: Pos Gerbang Masuk RT 004"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-200">
                Resource Stream URL (VDO.Ninja / YouTube / Stream MP4)
              </label>
              {camForm.stream_url && (
                <button
                  type="button"
                  onClick={() => setPreviewStream(!previewStream)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                >
                  {previewStream ? 'Sembunyikan Preview' : 'Uji / Preview Stream'}
                </button>
              )}
            </div>
            <input
              type="text"
              value={camForm.stream_url}
              onChange={(e) => setCamForm({ ...camForm, stream_url: e.target.value })}
              placeholder="contoh: https://vdo.ninja/?view=mycctvroom atau https://youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Kosongkan jika ingin menggunakan tampilan standby visual standar SIAGA.
            </p>
          </div>

          {/* Live Preview Inside Modal */}
          {previewStream && camForm.stream_url && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/40">
              <span className="text-[10px] font-mono text-indigo-300 font-semibold mb-2 block">
                LIVE PREVIEW PLAYER:
              </span>
              <CctvPlayer
                camera={{
                  id: editingCamera?.id || 99,
                  nama: camForm.nama || 'Preview Stream',
                  lokasi: camForm.lokasi || 'Lokasi Uji Coba',
                  status: camForm.status,
                  stream_url: camForm.stream_url,
                }}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Status Kamera</label>
              <select
                value={camForm.status}
                onChange={(e) => setCamForm({ ...camForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="online">Online (Siap Tayang)</option>
                <option value="offline">Offline (Pemeliharaan / Nonaktif)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Izin Akses Warga</label>
              <select
                value={camForm.akses_diizinkan ? '1' : '0'}
                onChange={(e) =>
                  setCamForm({ ...camForm, akses_diizinkan: e.target.value === '1' })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="1">Diizinkan (Tampil di Dashboard Warga)</option>
                <option value="0">Terbatas (Hanya Pengurus RT/RW)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Keterangan / Catatan Teknis (Opsional)
            </label>
            <input
              type="text"
              value={camForm.keterangan}
              onChange={(e) => setCamForm({ ...camForm, keterangan: e.target.value })}
              placeholder="contoh: Pemantauan 24 jam, menghadap pos jaga utama"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCameraModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingCam}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              {savingCam ? 'Menyimpan...' : 'Simpan Titik Kamera'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT EMERGENCY CONTACT */}
      <Modal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={editingContact ? `Edit Kontak: ${editingContact.nama}` : 'Tambah Kontak Darurat'}
        description="Nomor kontak akan ditampilkan pada halaman keamanan warga untuk panggilan darurat."
        size="md"
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Nama Kontak / Instansi</label>
            <input
              type="text"
              required
              value={contactForm.nama}
              onChange={(e) => setContactForm({ ...contactForm, nama: e.target.value })}
              placeholder="contoh: Poskamling RW 002"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Peran / Jabatan</label>
            <input
              type="text"
              required
              value={contactForm.peran}
              onChange={(e) => setContactForm({ ...contactForm, peran: e.target.value })}
              placeholder="contoh: Satpam Gerbang / Pos Jaga"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              required
              value={contactForm.telepon}
              onChange={(e) => setContactForm({ ...contactForm, telepon: e.target.value })}
              placeholder="contoh: 0812-5555-0199 atau 110"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
              <select
                value={contactForm.kategori}
                onChange={(e) => setContactForm({ ...contactForm, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="lingkungan">Lingkungan RT/RW</option>
                <option value="keamanan">Keamanan / Pos Satpam</option>
                <option value="darurat">Darurat Publik (Polisi/Damkar/RS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Nomor Urutan</label>
              <input
                type="number"
                min="1"
                value={contactForm.urutan}
                onChange={(e) =>
                  setContactForm({ ...contactForm, urutan: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingContact}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              {savingContact ? 'Menyimpan...' : 'Simpan Kontak'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

