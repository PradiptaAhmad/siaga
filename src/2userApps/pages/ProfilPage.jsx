import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Save, User as UserIcon, Users, Plus, X, Award, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import PageBanner from "../../components/user/PageBanner";
import StatCard from "../../components/user/StatCard";
import DataTable from "../../components/user/DataTable";
import { useAuth } from "../../context/AuthContext";
import api, { getErrorMessage } from "../../lib/api";

import iconPoin from "../../assets/img/UserDashboard/StatPoin.png";
import iconBadge from "../../assets/img/UserDashboard/StatBadge.png";
import iconFamily from "../../assets/img/UserDashboard/IconFamily.png";

const familyColumns = [
  { key: "no", label: "No.", render: (_row, i) => String(i + 1).padStart(2, "0") },
  {
    key: "nama",
    label: "Nama Anggota",
    render: (row) => <span className="font-semibold text-slate-800">{row.nama}</span>,
  },
  {
    key: "nik",
    label: "NIK",
    render: (row) => <span className="font-mono text-slate-600 text-xs">{row.nik}</span>,
  },
  {
    key: "hubungan",
    label: "Hubungan Keluarga",
    render: (row) => (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
        {row.hubungan}
      </span>
    ),
  },
  {
    key: "jenis_kelamin",
    label: "Jenis Kelamin",
    render: (row) => <span className="text-slate-600">{row.jenis_kelamin}</span>,
  },
];

export default function ProfilPage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    no_hp: user?.no_hp || "",
    alamat: user?.alamat || "",
    rt: user?.rt || "004",
    rw: user?.rw || "002",
  });
  const [saving, setSaving] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [requestModal, setRequestModal] = useState(false);
  const [requestType, setRequestType] = useState("kelahiran");
  const [requestForm, setRequestForm] = useState({
    nama: "",
    nik: "",
    keterangan: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        no_hp: user.no_hp || "",
        alamat: user.alamat || "",
        rt: user.rt || "004",
        rw: user.rw || "002",
      });
      if (Array.isArray(user.family_members)) {
        setFamilyMembers(
          user.family_members.map((m, idx) => ({
            id: m.id || idx,
            nama: m.nama,
            nik: m.nik || "-",
            hubungan: m.hubungan || "Anggota",
            jenis_kelamin: m.jenis_kelamin === "L" ? "Laki-laki" : m.jenis_kelamin === "P" ? "Perempuan" : m.jenis_kelamin,
          }))
        );
      }
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", form);
      if (refreshUser) await refreshUser();
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: "Informasi profil berhasil diperbarui.",
        confirmButtonColor: "#0F5A6B",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: getErrorMessage(err) || "Gagal menyimpan profil.",
        confirmButtonColor: "#0F5A6B",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post("/family-requests", {
        tipe: requestType,
        nama: requestForm.nama,
        nik: requestForm.nik,
        alasan: requestForm.keterangan || "Pengajuan data kependudukan",
      });
      Swal.fire({
        icon: "success",
        title: "Pengajuan Terkirim",
        text: "Pengurus RT/RW akan memverifikasi permohonan data kependudukan keluarga Anda.",
        confirmButtonColor: "#0F5A6B",
      });
      setRequestModal(false);
      setRequestForm({ nama: "", nik: "", keterangan: "" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengajukan",
        text: getErrorMessage(err) || "Gagal mengirim pengajuan.",
        confirmButtonColor: "#0F5A6B",
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar dari SIAGA?",
      text: "Anda akan keluar dari sesi akun ini.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#26383D",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true });
      }
    });
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <PageBanner
        title="Profil Pengguna"
        subtitle="Kelola informasi data keluarga, kontak, dan pengaturan akun SIAGA Anda."
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <StatCard
          icon={iconFamily}
          title="Kepala Keluarga"
          subtitle="Terdaftar resmi di RT/RW"
          value={user?.name || "Budi Santoso"}
          badge="Terverifikasi"
          badgeIcon={iconBadge}
        />
        <StatCard
          icon={iconPoin}
          title="Poin Keaktifan"
          subtitle="Partisipasi kegiatan lingkungan"
          value={`${user?.poin_keaktifan ?? 320} Poin`}
          badge="Warga Teladan"
          badgeIcon={iconBadge}
        />
        <StatCard
          icon={iconBadge}
          title="Nomor Kartu Keluarga"
          subtitle="Data induk kependudukan"
          value={user?.no_kk || "3513141508210001"}
        />
      </section>

      {/* Form Profil */}
      <section className="rounded-xl bg-[#F5F7F6] p-5 shadow-md md:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#26383D] text-white">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#26383D]">Informasi Akun Warga</h2>
              <p className="text-xs text-gray-600">Perbarui nomor handphone dan alamat tempat tinggal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#26383D]">Nama Lengkap</label>
            <input
              type="text"
              value={form.name}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2 text-xs text-gray-600 outline-none"
            />
            <span className="text-[10px] text-gray-500">*Untuk perubahan nama, hubungi pengurus RT</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#26383D]">Alamat Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2 text-xs text-gray-600 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#26383D]">Nomor WhatsApp / HP</label>
            <input
              type="text"
              value={form.no_hp}
              onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              placeholder="081234567890"
              className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none transition focus:ring-2 focus:ring-[#3CC4B0]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#26383D]">RT</label>
              <input
                type="text"
                value={form.rt}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2 text-xs text-gray-600 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#26383D]">RW</label>
              <input
                type="text"
                value={form.rw}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2 text-xs text-gray-600 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-[#26383D]">Alamat Rumah</label>
            <textarea
              rows={3}
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none transition focus:ring-2 focus:ring-[#3CC4B0]/40"
            />
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#F7B538] px-6 py-2.5 text-xs font-bold text-[#0F4C5C] shadow-md transition hover:bg-[#e5a52c] disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Daftar Anggota Keluarga */}
      <section className="rounded-xl bg-[#F5F7F6] p-5 shadow-md md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users size={18} className="text-[#0F5A6B]" />
            <h3 className="text-sm font-bold text-[#26383D]">Daftar Anggota Keluarga Terdaftar</h3>
          </div>
          <button
            type="button"
            onClick={() => setRequestModal(true)}
            className="flex items-center gap-1 rounded-md bg-[#0F5A6B] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0c4756]"
          >
            <Plus size={14} />
            <span>Ajukan Perubahan KK</span>
          </button>
        </div>

        <DataTable
          columns={familyColumns}
          rows={
            familyMembers.length > 0
              ? familyMembers
              : [
                  { id: 1, nama: user?.name || "Budi Santoso", nik: "3513141508210001", hubungan: "Kepala Keluarga", jenis_kelamin: "Laki-laki" },
                  { id: 2, nama: "Siti Rahmawati", nik: "3513145609820002", hubungan: "Istri", jenis_kelamin: "Perempuan" },
                  { id: 3, nama: "Dimas Pratama", nik: "3513141203150003", hubungan: "Anak", jenis_kelamin: "Laki-laki" },
                ]
          }
        />
      </section>

      {/* Modal Pengajuan Perubahan KK (Kelahiran/Kematian/Pindah) */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-[#F5F7F6] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setRequestModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-[#0F5A6B]">
              Ajukan Perubahan Data Keluarga
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Laporkan peristiwa kelahiran, kematian, atau kepindahan anggota keluarga kepada pengurus RT.
            </p>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Jenis Peristiwa</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3 py-2 text-xs text-gray-800 outline-none"
                >
                  <option value="kelahiran">Kelahiran Anggota Baru</option>
                  <option value="kematian">Kematian Anggota Keluarga</option>
                  <option value="pindah">Kepindahan / Pindah Domisili</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Nama Lengkap Bersangkutan</label>
                <input
                  type="text"
                  required
                  value={requestForm.nama}
                  onChange={(e) => setRequestForm({ ...requestForm, nama: e.target.value })}
                  placeholder="Nama anggota keluarga"
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">NIK (Jika Ada)</label>
                <input
                  type="text"
                  value={requestForm.nik}
                  onChange={(e) => setRequestForm({ ...requestForm, nik: e.target.value })}
                  placeholder="Nomor Induk Kependudukan"
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Keterangan / Alasan</label>
                <textarea
                  rows={3}
                  value={requestForm.keterangan}
                  onChange={(e) => setRequestForm({ ...requestForm, keterangan: e.target.value })}
                  placeholder="Misal: Surat pengantar permohonan akta kelahiran..."
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-[#F7B538] py-2.5 text-xs font-bold text-[#0F4C5C] shadow-md transition hover:bg-[#e5a52c]"
              >
                Kirimkan Pengajuan ke RT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
