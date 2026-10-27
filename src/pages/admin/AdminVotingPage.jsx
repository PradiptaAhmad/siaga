import { useState, useEffect } from 'react'
import {
  Vote,
  Plus,
  CheckCircle2,
  Lock,
  ThumbsUp,
  RefreshCw,
  Calendar,
  Trash2,
  Lightbulb,
} from 'lucide-react'
import api from '../../lib/api'
import { formatDate } from '../../lib/format'
import { toastSuccess, showError, confirmAction } from '../../lib/alerts'
import { getErrorMessage } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import PageBanner from '../../components/user/PageBanner'

export default function AdminVotingPage() {
  const [votings, setVotings] = useState([])
  const [aspirations, setAspirations] = useState([])
  const [loading, setLoading] = useState(true)

  // Create Voting Modal
  const [votingModalOpen, setVotingModalOpen] = useState(false)
  const [votingForm, setVotingForm] = useState({
    judul: '',
    deskripsi: '',
    deadline: '',
    options: ['', ''],
  })
  const [submittingVoting, setSubmittingVoting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [resVotings, resAsp] = await Promise.all([
        api.get('/votings'),
        api.get('/aspirations'),
      ])
      setVotings(resVotings.data.votings || [])
      setAspirations(resAsp.data.aspirations || [])
    } catch (err) {
      showError('Gagal Mengambil Data', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Voting Handlers
  const handleAddOption = () => {
    setVotingForm({ ...votingForm, options: [...votingForm.options, ''] })
  }

  const handleOptionChange = (idx, val) => {
    const next = [...votingForm.options]
    next[idx] = val
    setVotingForm({ ...votingForm, options: next })
  }

  const handleRemoveOption = (idx) => {
    if (votingForm.options.length <= 2) return
    const next = votingForm.options.filter((_, i) => i !== idx)
    setVotingForm({ ...votingForm, options: next })
  }

  const handleCreateVoting = async (e) => {
    e.preventDefault()
    const validOptions = votingForm.options.map((o) => o.trim()).filter(Boolean)
    if (validOptions.length < 2) {
      showError('Opsi Kurang', 'Minimal harus ada 2 opsi pilihan voting.')
      return
    }

    setSubmittingVoting(true)
    try {
      await api.post('/admin/votings', {
        judul: votingForm.judul,
        deskripsi: votingForm.deskripsi,
        deadline: votingForm.deadline,
        options: validOptions,
      })
      toastSuccess('Voting musyawarah warga berhasil diterbitkan!')
      setVotingModalOpen(false)
      setVotingForm({ judul: '', deskripsi: '', deadline: '', options: ['', ''] })
      loadData()
    } catch (err) {
      showError('Gagal Menerbitkan Voting', getErrorMessage(err))
    } finally {
      setSubmittingVoting(false)
    }
  }

  const handleCloseVoting = async (voting) => {
    const confirmed = await confirmAction({
      title: 'Tutup Voting Program Ini?',
      text: `Voting "${voting.judul}" akan disahkan dan warga tidak dapat memberikan suara lagi.`,
      confirmText: 'Ya, Tutup & Sahkan',
    })
    if (!confirmed) return

    try {
      await api.post(`/admin/votings/${voting.id}/close`)
      toastSuccess('Voting telah ditutup dan hasil disahkan.')
      loadData()
    } catch (err) {
      showError('Gagal Menutup Voting', getErrorMessage(err))
    }
  }

  // Aspiration Status Handler
  const handleUpdateAspiration = async (aspiration, status) => {
    try {
      await api.put(`/admin/aspirations/${aspiration.id}/status`, { status })
      toastSuccess(`Status usulan diperbarui menjadi ${status.toUpperCase()}`)
      loadData()
    } catch (err) {
      showError('Gagal Memperbarui Usulan', getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <PageBanner
        title="Musyawarah, E-Voting & Partisipasi Warga"
        subtitle="Terbitkan agenda voting program prioritas RT/RW dan kelola usulan inisiatif dari kepala keluarga."
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <p className="text-xs text-slate-600 font-medium">
          Total: <span className="font-bold text-[#0F5A6B]">{votings.length} Agenda Voting</span> •{' '}
          <span className="font-bold text-[#0F5A6B]">{aspirations.length} Aspirasi Warga</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <button
            onClick={() => setVotingModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#F4B740] hover:bg-[#e0a430] text-xs font-bold text-[#26383D] inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Buat E-Voting Baru
          </button>
        </div>
      </div>

      {/* Section 1: Active & Past Votings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-[#0F5A6B]" />
          <h2 className="text-lg font-bold text-slate-800">Program E-Voting Berjalan & Selesai</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {votings.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
              Belum ada program e-voting yang dibuat.
            </div>
          ) : (
            votings.map((v) => {
              const isBerjalan = v.status === 'berjalan'
              const totalVotes =
                v.total_votes ||
                v.options?.reduce((acc, opt) => acc + (opt.votes_count || 0), 0) ||
                0

              return (
                <div
                  key={v.id}
                  className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-[#13B8A6] transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isBerjalan
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {v.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" /> Tenggat: {formatDate(v.deadline)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-2.5">{v.judul}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.deskripsi}</p>

                    {/* Options and vote progress bars */}
                    <div className="mt-4 space-y-2.5">
                      {v.options?.map((opt) => {
                        const count = opt.votes_count || 0
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                        return (
                          <div
                            key={opt.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-800">{opt.judul}</span>
                              <span className="font-mono text-[#0F5A6B] font-bold">
                                {count} suara ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#13B8A6] to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Voting footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Total Partisipasi: <strong className="text-slate-800">{totalVotes} Kepala Keluarga</strong>
                    </span>
                    {isBerjalan && (
                      <button
                        onClick={() => handleCloseVoting(v)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Lock className="h-3.5 w-3.5" /> Tutup & Sahkan
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Section 2: Citizen Aspirations Management */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Usulan & Inisiatif Warga</h2>
            <p className="text-xs text-slate-500">
              Tinjau usulan ide warga dan tentukan apakah diterima menjadi rencana kerja RT/RW.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aspirations.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm hover:border-[#13B8A6] transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-[#0F5A6B] border border-teal-200 font-mono font-semibold">
                    {a.kategori || 'Inisiatif Lingkungan'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                      a.status === 'diterima'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : a.status === 'ditolak'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800">{a.judul}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{a.deskripsi}</p>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  Oleh: {a.user?.name || 'Warga'} • <span className="font-bold text-[#0F5A6B]">{a.supports_count ?? 0} Dukungan</span>
                </p>
              </div>

              {/* Status Actions */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">Ubah Status:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateAspiration(a, 'diterima')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition"
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => handleUpdateAspiration(a, 'ditinjau')}
                    className="px-2.5 py-1 rounded-md bg-teal-50 text-[#0F5A6B] hover:bg-teal-100 border border-teal-200 text-[11px] font-semibold transition"
                  >
                    Tinjau
                  </button>
                  <button
                    onClick={() => handleUpdateAspiration(a, 'ditolak')}
                    className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] transition"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE VOTING */}
      <Modal
        open={votingModalOpen}
        onClose={() => setVotingModalOpen(false)}
        title="Buat Program E-Voting Warga"
        description="Terbitkan jajak pendapat program untuk dipilih oleh seluruh kepala keluarga RT/RW."
        size="lg"
      >
        <form onSubmit={handleCreateVoting} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Program Prioritas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={votingForm.judul}
              onChange={(e) => setVotingForm({ ...votingForm, judul: e.target.value })}
              placeholder="contoh: Pemilihan Prioritas Alokasi Dana Kas RW Triwulan IV"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi & Latar Belakang Program <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={votingForm.deskripsi}
              onChange={(e) => setVotingForm({ ...votingForm, deskripsi: e.target.value })}
              placeholder="Jelaskan tujuan musyawarah dan dampak bagi warga..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batas Waktu Voting (Deadline) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={votingForm.deadline}
              onChange={(e) => setVotingForm({ ...votingForm, deadline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Dynamic Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pilihan Opsi Voting (Minimal 2 Pilihan) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-[11px] font-bold text-slate-700 hover:text-indigo-300"
              >
                + Tambah Pilihan
              </button>
            </div>

            <div className="space-y-2">
              {votingForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Opsi Pilihan ${idx + 1}`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  {votingForm.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-rose-400 hover:bg-white/5 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setVotingModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingVoting}
              className="px-4 py-2 rounded-xl bg-[#F4B740] hover:bg-[#e0a430] text-white text-xs font-bold"
            >
              {submittingVoting ? 'Menerbitkan...' : 'Terbitkan Program Voting'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

