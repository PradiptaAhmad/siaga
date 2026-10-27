import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Award,
  Phone,
  Home,
  UserCheck,
  FileText,
  Baby,
  HeartCrack,
  Truck,
  ExternalLink,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Clock,
  Eye,
} from 'lucide-react'
import api, { getErrorMessage } from '../../lib/api'
import { toastSuccess, showError, showSuccess, confirmAction } from '../../lib/alerts'
import { formatDate } from '../../lib/format'
import Modal from '../../components/ui/Modal'
import PageBanner from '../../components/user/PageBanner'

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('direktori') // 'direktori' | 'pengajuan'
  const [users, setUsers] = useState([])
  const [familyRequests, setFamilyRequests] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [requestFilter, setRequestFilter] = useState('semua')

  // 1. Create New Warga (KK) Modal
  const [createWargaOpen, setCreateWargaOpen] = useState(false)
  const [wargaForm, setWargaForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    no_kk: '',
    no_hp: '',
    alamat: 'Jl. Griya Asri No. ',
    rt: '004',
    rw: '002',
    status_akun: 'aktif',
    poin_keaktifan: 100,
  })
  const [creatingWarga, setCreatingWarga] = useState(false)

  // 2. Edit User Status Modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [statusForm, setStatusForm] = useState({
    status_akun: 'aktif',
    poin_keaktifan: 0,
  })
  const [savingStatus, setSavingStatus] = useState(false)

  // 3. Manage Family Members Modal (Wali / KK)
  const [manageMembersUser, setManageMembersUser] = useState(null)
  const [userMembers, setUserMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [memberForm, setMemberForm] = useState({
    nama: '',
    nik: '',
    hubungan: 'Anak',
    status: 'aktif',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    tanggal_peristiwa: '',
    pekerjaan: 'Pelajar',
    pendidikan: 'SMA',
    catatan: '',
  })
  const [savingMember, setSavingMember] = useState(false)

  // 4. Request Approval & Rejection Modal
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState('approve') // 'approve' | 'reject'
  const [actionNote, setActionNote] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [resUsers, resRequests] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/family-requests', { params: { status: requestFilter } }),
      ])
      setUsers(resUsers.data.users || [])
      setFamilyRequests(resRequests.data.requests || [])
      setPendingCount(resRequests.data.pending_count || 0)
    } catch (err) {
      showError('Gagal Mengambil Data', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [requestFilter])

  // --- Warga Management ---
  const handleCreateWarga = async (e) => {
    e.preventDefault()
    setCreatingWarga(true)
    try {
      await api.post('/admin/users', wargaForm)
      showSuccess('Warga Baru Terdaftar', `Kepala Keluarga ${wargaForm.name} berhasil ditambahkan.`)
      setCreateWargaOpen(false)
      setWargaForm({
        name: '',
        email: '',
        password: 'password123',
        no_kk: '',
        no_hp: '',
        alamat: 'Jl. Griya Asri No. ',
        rt: '004',
        rw: '002',
        status_akun: 'aktif',
        poin_keaktifan: 100,
      })
      loadData()
    } catch (err) {
      showError('Gagal Menambah Warga', getErrorMessage(err))
    } finally {
      setCreatingWarga(false)
    }
  }

  const handleOpenEditStatus = (u) => {
    setSelectedUser(u)
    setStatusForm({
      status_akun: u.status_akun || 'aktif',
      poin_keaktifan: u.poin_keaktifan ?? 0,
    })
  }

  const handleSaveStatus = async (e) => {
    e.preventDefault()
    setSavingStatus(true)
    try {
      await api.put(`/admin/users/${selectedUser.id}/status`, statusForm)
      toastSuccess(`Status akun ${selectedUser.name} berhasil diperbarui.`)
      setSelectedUser(null)
      loadData()
    } catch (err) {
      showError('Gagal Memperbarui Status', getErrorMessage(err))
    } finally {
      setSavingStatus(false)
    }
  }

  // --- Family Member Management by Admin ---
  const handleOpenManageMembers = async (user) => {
    setManageMembersUser(user)
    setMemberFormOpen(false)
    setEditingMember(null)
    setLoadingMembers(true)
    try {
      const res = await api.get(`/admin/users/${user.id}/family-members`)
      setUserMembers(res.data.family_members || [])
    } catch (err) {
      showError('Gagal Mengambil Anggota KK', getErrorMessage(err))
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleOpenMemberForm = (member = null) => {
    if (member) {
      setEditingMember(member)
      setMemberForm({
        nama: member.nama || '',
        nik: member.nik || '',
        hubungan: member.hubungan || 'Anak',
        status: member.status || 'aktif',
        jenis_kelamin: member.jenis_kelamin || 'Laki-laki',
        tempat_lahir: member.tempat_lahir || '',
        tanggal_lahir: member.tanggal_lahir ? member.tanggal_lahir.split('T')[0] : '',
        tanggal_peristiwa: member.tanggal_peristiwa ? member.tanggal_peristiwa.split('T')[0] : '',
        pekerjaan: member.pekerjaan || '',
        pendidikan: member.pendidikan || 'SMA',
        catatan: member.catatan || '',
      })
    } else {
      setEditingMember(null)
      setMemberForm({
        nama: '',
        nik: '',
        hubungan: 'Anak',
        status: 'aktif',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: '',
        tanggal_lahir: '',
        tanggal_peristiwa: '',
        pekerjaan: 'Pelajar',
        pendidikan: 'SMA',
        catatan: '',
      })
    }
    setMemberFormOpen(true)
  }

  const handleSaveMember = async (e) => {
    e.preventDefault()
    if (!memberForm.nama.trim()) {
      showError('Form Belum Lengkap', 'Nama anggota keluarga wajib diisi.')
      return
    }
    setSavingMember(true)
    try {
      if (editingMember) {
        await api.put(`/admin/family-members/${editingMember.id}`, memberForm)
        toastSuccess(`Data ${memberForm.nama} berhasil diperbarui.`)
      } else {
        await api.post(`/admin/users/${manageMembersUser.id}/family-members`, memberForm)
        toastSuccess(`Anggota ${memberForm.nama} berhasil ditambahkan ke KK.`)
      }
      setMemberFormOpen(false)
      setEditingMember(null)
      // reload members
      const res = await api.get(`/admin/users/${manageMembersUser.id}/family-members`)
      setUserMembers(res.data.family_members || [])
      loadData()
    } catch (err) {
      showError('Gagal Menyimpan Anggota', getErrorMessage(err))
    } finally {
      setSavingMember(false)
    }
  }

  const handleDeleteMember = async (member) => {
    const confirmed = await confirmAction({
      title: 'Hapus Anggota Keluarga?',
      text: `Apakah Anda yakin ingin menghapus ${member.nama} dari daftar KK?`,
      confirmText: 'Ya, Hapus',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(`/admin/family-members/${member.id}`)
      toastSuccess(`Data ${member.nama} telah dihapus.`)
      const res = await api.get(`/admin/users/${manageMembersUser.id}/family-members`)
      setUserMembers(res.data.family_members || [])
      loadData()
    } catch (err) {
      showError('Gagal Menghapus Anggota', getErrorMessage(err))
    }
  }

  // --- Request Approval & Rejection ---
  const handleOpenActionModal = (req, type) => {
    setSelectedRequest(req)
    setActionType(type)
    setActionNote(
      type === 'approve'
        ? 'Pengajuan data anggota keluarga disetujui & disahkan pengurus RT/RW.'
        : 'Dokumen / data pengajuan belum lengkap atau tidak valid.'
    )
  }

  const handleProcessAction = async (e) => {
    e.preventDefault()
    setProcessingAction(true)
    try {
      if (actionType === 'approve') {
        const res = await api.post(`/admin/family-requests/${selectedRequest.id}/approve`, {
          catatan_admin: actionNote,
        })
        showSuccess('Pengajuan Disetujui (ACC)', res.data.message)
      } else {
        const res = await api.post(`/admin/family-requests/${selectedRequest.id}/reject`, {
          catatan_admin: actionNote,
        })
        showSuccess('Pengajuan Ditolak', res.data.message)
      }
      setSelectedRequest(null)
      loadData()
    } catch (err) {
      showError('Gagal Memproses Pengajuan', getErrorMessage(err))
    } finally {
      setProcessingAction(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.no_kk?.toLowerCase().includes(term) ||
      u.alamat?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header Banner */}
      <PageBanner
        title="Direktori Warga & Mutasi Kartu Keluarga (KK)"
        subtitle="Kelola kepala keluarga, anggota KK, serta verifikasi laporan kelahiran, kematian, dan mutasi warga."
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <p className="text-xs text-slate-600 font-medium">
          Total: <span className="font-bold text-[#0F5A6B]">{users.length} Kepala Keluarga</span> •{' '}
          <span className="font-bold text-[#0F5A6B]">{familyRequests.length} Pengajuan Mutasi</span>
        </p>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setCreateWargaOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#F4B740] hover:bg-[#e0a430] text-xs font-bold text-[#26383D] inline-flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Warga (KK)
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-sm">
        <button
          onClick={() => setActiveTab('direktori')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'direktori'
              ? 'border-[#13B8A6] text-[#0F5A6B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          Direktori Kepala Keluarga ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('pengajuan')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'pengajuan'
              ? 'border-[#13B8A6] text-[#0F5A6B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Verifikasi Mutasi KK (Acc Laporan Warga)
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F4B740] text-[#26383D]">
              {pendingCount} Menunggu
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIREKTORI KEPALA KELUARGA */}
      {activeTab === 'direktori' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama warga, nomor KK, alamat..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#13B8A6] focus:ring-1 focus:ring-[#13B8A6]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <span className="text-xs font-mono text-slate-500">
              Menampilkan: <strong className="text-slate-800">{filteredUsers.length} Kepala Keluarga</strong>
            </span>
          </div>

          {/* Table */}
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-[#E6F4F1] via-[#EEF8F6] to-[#E6F4F1] border-b border-slate-200 text-[#0F5A6B] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Nama & Kontak</th>
                    <th className="px-5 py-3.5">Nomor KK & Alamat</th>
                    <th className="px-5 py-3.5">Anggota KK</th>
                    <th className="px-5 py-3.5">Poin</th>
                    <th className="px-5 py-3.5">Status Akun</th>
                    <th className="px-5 py-3.5 text-right">Kelola & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        Tidak ada data warga yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAktif = u.status_akun === 'aktif'
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-teal-100 text-[#0F5A6B] grid place-items-center font-bold text-xs shrink-0">
                                {u.name?.charAt(0) || 'W'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                                  {u.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block">{u.email}</span>
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                  <Phone className="h-2.5 w-2.5" /> {u.no_hp || '-'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-mono text-slate-800 font-bold block">
                              KK: {u.no_kk || '-'}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Home className="h-3 w-3 text-slate-400" /> {u.alamat || 'Griya Asri'} (RT {u.rt} / RW {u.rw})
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleOpenManageMembers(u)}
                              className="px-2.5 py-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-[11px] inline-flex items-center gap-1.5 transition"
                              title="Klik untuk kelola anggota keluarga"
                            >
                              <Users className="h-3.5 w-3.5" />
                              {(u.family_members_count ?? 0) + 1} Jiwa Terdaftar
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                              <Award className="h-3.5 w-3.5" /> {u.poin_keaktifan ?? 0}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase inline-block ${
                                isAktif
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {u.status_akun || 'aktif'}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenManageMembers(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition"
                                title="Kelola Anggota Keluarga"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Anggota KK
                              </button>
                              <button
                                onClick={() => handleOpenEditStatus(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition"
                                title="Atur Status & Poin"
                              >
                                <Edit2 className="h-3.5 w-3.5" /> Status
                              </button>
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
        </div>
      )}

      {/* TAB 2: VERIFIKASI PENGAJUAN MUTASI KK (ACC LAPORAN WARGA) */}
      {activeTab === 'pengajuan' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1 font-mono">Status Pengajuan:</span>
              {[
                { id: 'semua', label: 'Semua Pengajuan' },
                { id: 'menunggu', label: `Menunggu ACC (${pendingCount})` },
                { id: 'disetujui', label: 'Telah Disetujui' },
                { id: 'ditolak', label: 'Ditolak' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRequestFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    requestFilter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-400">
              Total Laporan: <strong className="text-white">{familyRequests.length}</strong>
            </span>
          </div>

          {/* List of Requests */}
          {familyRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-white/10">
              <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tidak Ada Pengajuan Mutasi KK</p>
              <p className="text-xs text-slate-400 mt-1">
                Laporan perubahan anggota keluarga (kelahiran, kematian, pindah) dari warga akan muncul di sini untuk di-ACC pengurus.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {familyRequests.map((req) => {
                const isPending = req.status === 'menunggu'
                const isApproved = req.status === 'disetujui'

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {req.tipe === 'kelahiran' && (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                            <Baby className="h-3.5 w-3.5" /> Kelahiran / Anggota Baru
                          </span>
                        )}
                        {req.tipe === 'kematian' && (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                            <HeartCrack className="h-3.5 w-3.5" /> Laporan Kematian
                          </span>
                        )}
                        {req.tipe === 'pindah' && (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" /> Laporan Pindah / Mutasi
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {req.status === 'menunggu' ? 'Menunggu Verifikasi RT/RW' : req.status}
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono">
                          Diajukan: {formatDate(req.created_at)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-white">
                          {req.nama} ({req.hubungan || 'Anggota'})
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Kepala Keluarga Pengaju:{' '}
                          <strong className="text-indigo-300">{req.user?.name}</strong> • No. KK:{' '}
                          <span className="font-mono text-white">{req.user?.no_kk || '-'}</span> • HP:{' '}
                          <span className="font-mono">{req.user?.no_hp || '-'}</span>
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">Detail Anggota:</span>
                          <p>
                            NIK: <strong className="font-mono text-white">{req.nik || '-'}</strong> • Gender:{' '}
                            {req.jenis_kelamin || '-'}
                          </p>
                          {req.tanggal_lahir && (
                            <p className="text-[11px] text-slate-400">
                              Lahir: {req.tempat_lahir ? `${req.tempat_lahir}, ` : ''}{formatDate(req.tanggal_lahir)}
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">
                            Tanggal Peristiwa / Keterangan:
                          </span>
                          {req.tanggal_peristiwa && (
                            <p className="text-amber-300 font-medium">
                              📅 Tanggal Peristiwa: {formatDate(req.tanggal_peristiwa)}
                            </p>
                          )}
                          <p className="text-slate-400 text-[11px] line-clamp-2">
                            {req.keterangan || 'Tidak ada catatan tambahan.'}
                          </p>
                        </div>
                      </div>

                      {req.dokumen && (
                        <div className="pt-1">
                          <a
                            href={`/storage/${req.dokumen}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Lihat Lampiran Berkas Bukti (Surat/Akta)
                          </a>
                        </div>
                      )}

                      {req.catatan_admin && (
                        <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <strong>Catatan Pengurus:</strong> {req.catatan_admin}
                        </p>
                      )}
                    </div>

                    {/* Actions for Pending Requests */}
                    <div className="flex md:flex-col items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleOpenActionModal(req, 'approve')}
                            className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-md transition"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Setujui (ACC)
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(req, 'reject')}
                            className="w-full px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition"
                          >
                            <XCircle className="h-4 w-4" />
                            Tolak
                          </button>
                        </>
                      ) : (
                        <div className="text-center md:text-right text-[11px] text-slate-500 font-mono">
                          {isApproved ? '✓ Selesai & Di-ACC' : '✕ Telah Ditolak'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: TAMBAH WARGA BARU (KEPALA KELUARGA) */}
      <Modal
        open={createWargaOpen}
        onClose={() => setCreateWargaOpen(false)}
        title="Daftarkan Warga Baru (Kepala Keluarga)"
        description="Buat akun portal SIAGA untuk kepala keluarga baru di lingkungan RT 004 / RW 002."
        size="lg"
      >
        <form onSubmit={handleCreateWarga} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Keluarga *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Ahmad Dahlan"
                value={wargaForm.name}
                onChange={(e) => setWargaForm({ ...wargaForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK) *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="16 digit No. KK"
                value={wargaForm.no_kk}
                onChange={(e) => setWargaForm({ ...wargaForm, no_kk: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Login *</label>
              <input
                type="email"
                required
                placeholder="warga@siaga.id"
                value={wargaForm.email}
                onChange={(e) => setWargaForm({ ...wargaForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password Awal *</label>
              <input
                type="text"
                required
                value={wargaForm.password}
                onChange={(e) => setWargaForm({ ...wargaForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Rumah *</label>
              <input
                type="text"
                required
                placeholder="Jl. Griya Asri No. 24"
                value={wargaForm.alamat}
                onChange={(e) => setWargaForm({ ...wargaForm, alamat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
              <input
                type="tel"
                placeholder="08123456789"
                value={wargaForm.no_hp}
                onChange={(e) => setWargaForm({ ...wargaForm, no_hp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RT</label>
              <input
                type="text"
                value={wargaForm.rt}
                onChange={(e) => setWargaForm({ ...wargaForm, rt: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RW</label>
              <input
                type="text"
                value={wargaForm.rw}
                onChange={(e) => setWargaForm({ ...wargaForm, rw: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Poin Keaktifan Awal</label>
              <input
                type="number"
                min="0"
                value={wargaForm.poin_keaktifan}
                onChange={(e) => setWargaForm({ ...wargaForm, poin_keaktifan: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateWargaOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creatingWarga}
              className="px-5 py-2 rounded-xl bg-[#F4B740] hover:bg-[#e0a430] text-black text-xs font-bold shadow-md"
            >
              {creatingWarga ? 'Mendaftarkan...' : 'Daftarkan Warga'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: KELOLA ANGGOTA KELUARGA DARI WALI / KK INI */}
      <Modal
        open={Boolean(manageMembersUser)}
        onClose={() => setManageMembersUser(null)}
        title={`Anggota Kartu Keluarga: ${manageMembersUser?.name || ''}`}
        description={`Nomor KK: ${manageMembersUser?.no_kk || '-'} • Alamat: ${manageMembersUser?.alamat || '-'}`}
        size="xl"
      >
        {manageMembersUser && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-xs text-slate-300">
                Terdaftar: <strong className="text-white">{userMembers.length} Anggota Keluarga</strong> (Di luar Kepala Keluarga)
              </span>

              <button
                onClick={() => handleOpenMemberForm(null)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" /> + Tambah Anggota ke KK
              </button>
            </div>

            {/* Sub-form to Add/Edit Member */}
            {memberFormOpen && (
              <form onSubmit={handleSaveMember} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-indigo-300">
                  <span>{editingMember ? `Edit Anggota: ${editingMember.nama}` : 'Tambah Anggota Keluarga Baru'}</span>
                  <button
                    type="button"
                    onClick={() => setMemberFormOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama anggota"
                      value={memberForm.nama}
                      onChange={(e) => setMemberForm({ ...memberForm, nama: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="NIK"
                      value={memberForm.nik}
                      onChange={(e) => setMemberForm({ ...memberForm, nik: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hubungan Keluarga</label>
                    <select
                      value={memberForm.hubungan}
                      onChange={(e) => setMemberForm({ ...memberForm, hubungan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
                    >
                      <option value="Istri">Istri</option>
                      <option value="Suami">Suami</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Famili Lain">Famili Lain</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Keberadaan</label>
                    <select
                      value={memberForm.status}
                      onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-bold"
                    >
                      <option value="aktif">🟢 Aktif (Hidup / Tinggal)</option>
                      <option value="meninggal">🕊️ Meninggal Dunia</option>
                      <option value="pindah">📦 Pindah Domisili</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={memberForm.jenis_kelamin}
                      onChange={(e) => setMemberForm({ ...memberForm, jenis_kelamin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={memberForm.tanggal_lahir}
                      onChange={(e) => setMemberForm({ ...memberForm, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tgl Peristiwa (Wafat/Pindah)</label>
                    <input
                      type="date"
                      value={memberForm.tanggal_peristiwa}
                      onChange={(e) => setMemberForm({ ...memberForm, tanggal_peristiwa: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Karyawan Swasta / Pelajar"
                      value={memberForm.pekerjaan}
                      onChange={(e) => setMemberForm({ ...memberForm, pekerjaan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                    <input
                      type="text"
                      placeholder="Keterangan peristiwa / kondisi"
                      value={memberForm.catatan}
                      onChange={(e) => setMemberForm({ ...memberForm, catatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMemberFormOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    {savingMember ? 'Menyimpan...' : 'Simpan Anggota'}
                  </button>
                </div>
              </form>
            )}

            {/* List Members Table */}
            <div className="rounded-2xl bg-slate-950 border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Hubungan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tgl Lahir / Peristiwa</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {/* Wali / Kepala Keluarga Row */}
                  <tr className="bg-indigo-950/20 font-medium">
                    <td className="px-4 py-3 font-bold text-indigo-300 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      {manageMembersUser.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">-</td>
                    <td className="px-4 py-3 font-bold text-amber-300">Kepala Keluarga</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Aktif (Wali)
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">-</td>
                    <td className="px-4 py-3 text-right text-[10px] text-slate-500 font-mono">Wali KK</td>
                  </tr>

                  {userMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Belum ada anggota keluarga tambahan yang didaftarkan untuk KK ini.
                      </td>
                    </tr>
                  ) : (
                    userMembers.map((m) => {
                      const isAlive = m.status === 'aktif' || !m.status
                      const isDeceased = m.status === 'meninggal'
                      const isMoved = m.status === 'pindah'

                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3 font-semibold text-white">
                            {m.nama}
                            {m.catatan && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {m.catatan}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300">{m.nik || '-'}</td>
                          <td className="px-4 py-3 text-slate-300">{m.hubungan}</td>
                          <td className="px-4 py-3">
                            {isAlive && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Aktif
                              </span>
                            )}
                            {isDeceased && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                🕊️ Meninggal
                              </span>
                            )}
                            {isMoved && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                📦 Pindah
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                            {m.tanggal_lahir ? formatDate(m.tanggal_lahir) : '-'}
                            {m.tanggal_peristiwa && (
                              <span className="block text-[10px] text-amber-300">
                                Peristiwa: {formatDate(m.tanggal_peristiwa)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenMemberForm(m)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                                title="Edit Anggota"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white transition"
                                title="Hapus Anggota"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setManageMembersUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Tutup Jendela KK
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: ATUR STATUS AKUN WARGA */}
      <Modal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={`Atur Status Warga: ${selectedUser?.name || ''}`}
        description="Kelola hak akses portal warga dan poin keaktifan partisipasi."
        size="md"
      >
        {selectedUser && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Data Kepala Keluarga:
              </span>
              <p className="font-bold text-white text-sm mt-0.5">{selectedUser.name}</p>
              <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                KK: {selectedUser.no_kk || '-'} • Email: {selectedUser.email}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Status Akun</label>
              <select
                value={statusForm.status_akun}
                onChange={(e) => setStatusForm({ ...statusForm, status_akun: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="aktif">Aktif (Dapat mengakses seluruh fitur SIAGA)</option>
                <option value="nonaktif">Nonaktif (Akses ditangguhkan)</option>
                <option value="menunggu">Menunggu Verifikasi Berkas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Poin Keaktifan Warga (Gamifikasi Partisipasi)
              </label>
              <input
                type="number"
                min="0"
                value={statusForm.poin_keaktifan}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, poin_keaktifan: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingStatus}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                {savingStatus ? 'Menyimpan...' : 'Simpan Pembaruan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 4: VERIFIKASI ACC / REJECT PENGAJUAN */}
      <Modal
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={actionType === 'approve' ? 'Konfirmasi ACC & Pengesahan Data KK' : 'Tolak Laporan Pengajuan'}
        description={`Laporan ${selectedRequest?.tipe} atas nama ${selectedRequest?.nama} dari KK ${selectedRequest?.user?.name}.`}
        size="md"
      >
        {selectedRequest && (
          <form onSubmit={handleProcessAction} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs space-y-1">
              <p className="text-slate-400">
                Tindakan:{' '}
                <strong className={actionType === 'approve' ? 'text-emerald-400' : 'text-rose-400'}>
                  {actionType === 'approve'
                    ? 'Menyetujui & Memperbarui Otomatis ke Kartu Keluarga'
                    : 'Menolak Pengajuan'}
                </strong>
              </p>
              <p className="text-white">
                Anggota:{' '}
                <strong className="text-amber-300">
                  {selectedRequest.nama} ({selectedRequest.hubungan})
                </strong>
              </p>
              {selectedRequest.tipe === 'kelahiran' && actionType === 'approve' && (
                <p className="text-[11px] text-emerald-300">
                  ⚡ Sistem akan otomatis menambahkan {selectedRequest.nama} ke daftar anggota keluarga KK ini dengan status Aktif.
                </p>
              )}
              {selectedRequest.tipe === 'kematian' && actionType === 'approve' && (
                <p className="text-[11px] text-rose-300">
                  ⚡ Sistem akan otomatis mengubah status {selectedRequest.nama} menjadi "Meninggal Dunia".
                </p>
              )}
              {selectedRequest.tipe === 'pindah' && actionType === 'approve' && (
                <p className="text-[11px] text-sky-300">
                  ⚡ Sistem akan otomatis mengubah status {selectedRequest.nama} menjadi "Pindah Domisili".
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Catatan Pengurus RT/RW (Akan dikirim via notifikasi ke warga)
              </label>
              <textarea
                rows={3}
                required
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Tuliskan catatan atau instruksi pengambilan berkas fisik..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processingAction}
                className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-md transition ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processingAction
                  ? 'Memproses...'
                  : actionType === 'approve'
                  ? 'Ya, ACC & Perbarui Data'
                  : 'Tolak Pengajuan'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

