import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Upload, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";
import PageBanner from "../../components/user/PageBanner";
import StatCard from "../../components/user/StatCard";
import SectionHeader from "../../components/user/SectionHeader";
import ChartCard from "../../components/user/ChartCard";
import AduanCard from "../../components/user/AduanCard";
import AduanStatusChart from "../../components/user/AduanStatusChart";
import DataTable from "../../components/user/DataTable";
import StatusBadge from "../../components/user/StatusBadge";
import Pagination from "../../components/user/Pagination";
import { formatTanggal } from "../../utils/formatTanggal";
import api, { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

import iconTotalAduan from "../../assets/img/UserDashboard/iconTotalAduan.png";
import iconPenanganan from "../../assets/img/UserDashboard/iconPenanganan.png";
import iconDiputuskan from "../../assets/img/UserDashboard/iconDiputuskan.png";
import iconSeluruhWarga from "../../assets/img/UserDashboard/iconSeluruhWarga.png";
import iconHeaderAduanSaya from "../../assets/img/UserDashboard/iconHeaderAduanSaya.png";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";
import iconHeaderAduan from "../../assets/img/UserDashboard/HeaderAduan.png";

const PER_PAGE = 5;
const STATUS_OPTIONS = ["Semua", "Diterima", "Diproses", "Ditolak"];

function perBulan(rows, status) {
  const arr = Array(12).fill(0);
  rows
    .filter((r) => r.status === status)
    .forEach((r) => {
      const month = Number(r.tanggal?.slice(5, 7) || 1) - 1;
      if (month >= 0 && month < 12) arr[month] += 1;
    });
  return arr;
}

const tableColumns = [
  { key: "no", label: "No.", render: (row) => String(row.no).padStart(2, "0") },
  {
    key: "judul",
    label: "Aduan / Permohonan",
    render: (row) => <span className="font-semibold text-slate-800">{row.judul}</span>,
  },
  {
    key: "pengadu",
    label: "Nama Pengadu",
    render: (row) => <span className="font-medium text-slate-600">{row.pengadu}</span>,
  },
  {
    key: "tanggal",
    label: "Tanggal",
    render: (row) => (
      <span className="font-mono text-slate-500 text-[11px]">
        {row.tanggal ? formatTanggal(row.tanggal.slice(0, 10)) : "-"}
      </span>
    ),
  },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

export default function AduanPermohonan() {
  const { user } = useAuth();
  const [aduanSaya, setAduanSaya] = useState([]);
  const [aduanWarga, setAduanWarga] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  // Modal Tambah Aduan
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    jenis: "aduan",
    judul: "",
    kategori: "Infrastruktur",
    deskripsi: "",
    lokasi: "",
    prioritas: "sedang",
  });
  const [lampiran, setLampiran] = useState(null);

  const fetchComplaints = async () => {
    try {
      const [resUser, resPublic] = await Promise.allSettled([
        api.get("/complaints"),
        api.get("/public/complaints"),
      ]);

      if (resUser.status === "fulfilled" && resUser.value?.data?.complaints) {
        const myItems = resUser.value.data.complaints;
        setAduanSaya(
          myItems.map((c) => ({
            id: c.id,
            judul: c.judul,
            deskripsi: c.deskripsi,
            tanggal: c.created_at ? c.created_at.slice(0, 10) : "",
            status: c.status === "selesai" ? "Diterima" : c.status === "ditolak" ? "Ditolak" : "Diproses",
            progress: c.status === "selesai" ? 100 : c.status === "diproses" ? 60 : c.status === "diperiksa" ? 40 : 25,
          }))
        );
      } else {
        setAduanSaya([]);
      }

      if (resPublic.status === "fulfilled" && resPublic.value?.data?.complaints) {
        const publicItems = resPublic.value.data.complaints;
        setAduanWarga(
          publicItems.map((c) => ({
            id: c.id,
            judul: c.judul,
            pengadu: c.user?.name || c.pelapor || "Warga SIAGA",
            tanggal: c.created_at ? c.created_at.slice(0, 10) : "",
            status: c.status === "selesai" ? "Diterima" : c.status === "ditolak" ? "Ditolak" : "Diproses",
          }))
        );
      } else {
        setAduanWarga([]);
      }
    } catch (e) {
      console.warn("Gagal memuat aduan:", e);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmitAduan = async (e) => {
    e.preventDefault();
    if (!form.judul || form.deskripsi.length < 20) {
      Swal.fire({
        icon: "warning",
        title: "Periksa Formulir",
        text: "Deskripsi aduan harus minimal 20 karakter agar pengurus RT dapat menindaklanjuti dengan jelas.",
        confirmButtonColor: "#0F5A6B",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("jenis", form.jenis);
      formData.append("judul", form.judul);
      formData.append("kategori", form.kategori);
      formData.append("deskripsi", form.deskripsi);
      if (form.lokasi) formData.append("lokasi", form.lokasi);
      formData.append("prioritas", form.prioritas);
      if (lampiran) formData.append("lampiran", lampiran);

      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Aduan Berhasil Dikirim!",
        text: "Laporan Anda telah masuk ke sistem dan segera ditinjau oleh pengurus RT.",
        confirmButtonColor: "#0F5A6B",
      });

      setModalOpen(false);
      setForm({
        jenis: "aduan",
        judul: "",
        kategori: "Infrastruktur",
        deskripsi: "",
        lokasi: "",
        prioritas: "sedang",
      });
      setLampiran(null);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengirim",
        text: getErrorMessage(err) || "Gagal mengirimkan laporan aduan.",
        confirmButtonColor: "#0F5A6B",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Statistik dihitung dari data aduan milik user
  const stats = [
    {
      icon: iconTotalAduan,
      title: "Total Aduan / Permohonan",
      subtitle: "Jumlah aduan / permohonan saya yang telah dikirim dan diperiksa",
      value: aduanSaya.length,
    },
    {
      icon: iconPenanganan,
      title: "Sedang Dalam Penanganan",
      subtitle: "Jumlah aduan / permohonan saya yang dalam penanganan",
      value: aduanSaya.filter((a) => a.status === "Diproses").length,
    },
    {
      icon: iconDiputuskan,
      title: "Telah Diputuskan",
      subtitle: "Jumlah aduan / permohonan saya yang telah diputuskan hasilnya.",
      value: aduanSaya.filter((a) => a.status !== "Diproses").length,
    },
    {
      icon: iconSeluruhWarga,
      title: "Aduan / Permohonan dari Seluruh Warga",
      subtitle: "Jumlah aduan / permohonan dari seluruh warga SIAGA",
      value: aduanWarga.length,
    },
  ];

  const chartSeries = useMemo(
    () => ({
      Diterima: perBulan(aduanWarga, "Diterima"),
      Diproses: perBulan(aduanWarga, "Diproses"),
      Ditolak: perBulan(aduanWarga, "Ditolak"),
    }),
    [aduanWarga]
  );

  // Filter + pagination untuk tabel seluruh warga
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return aduanWarga.filter((row) => {
      const cocokStatus = statusFilter === "Semua" || row.status === statusFilter;
      const cocokQuery =
        !q || row.judul.toLowerCase().includes(q) || row.pengadu.toLowerCase().includes(q);
      return cocokStatus && cocokQuery;
    });
  }, [aduanWarga, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageRows = filtered
    .slice(start, start + PER_PAGE)
    .map((row, i) => ({ ...row, no: start + i + 1 }));

  return (
    <div className="space-y-4 md:space-y-5">
      <PageBanner
        title="Aduan & Permohonan Warga"
        subtitle="Pantau status aduan dan permohonan Anda, serta lihat laporan dari seluruh warga SIAGA."
      />

      {/* Kartu statistik: mobile 1 kolom | tablet 2 kolom | desktop 4 kolom */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      {/* Dua section utama: mobile bertumpuk | desktop berdampingan */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          icon={iconHeaderAduanSaya}
          title="Aduan / Permohonan Saya"
          subtitle="Lihat semua aduan / permohonan yang telah saya kirim"
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0F5A6B] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0c4756]"
            >
              <Plus size={14} />
              <span>+ Buat Laporan Baru</span>
            </button>
          </div>

          <div className="space-y-3 lg:max-h-[30rem] lg:overflow-y-auto lg:pr-1">
            {aduanSaya.length === 0 ? (
              <p className="py-10 text-center text-xs text-gray-500">
                Kamu belum mengirim aduan atau permohonan.
              </p>
            ) : (
              aduanSaya.map((item) => (
                <AduanCard key={item.id} {...item} to={`#`} />
              ))
            )}
          </div>
        </ChartCard>

        <ChartCard
          icon={iconHeaderGrafik}
          title="Grafik Aduan / Permohonan"
          subtitle="Lihat ringkasan aduan / permohonan"
        >
          <AduanStatusChart series={chartSeries} tahun={2026} />
        </ChartCard>
      </section>

      {/* Tabel seluruh warga */}
      <section className="space-y-1">
        <SectionHeader
          icon={iconHeaderAduan}
          title="Aduan & Permohonan Seluruh Warga"
          subtitle="Lihat seluruh aduan dan permohonan dari warga SIAGA beserta statusnya"
        />

        {/* Pencarian & filter status */}
        <div className="flex flex-col gap-2 rounded-lg bg-[#F5F7F6] p-3 shadow-md md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor="cari-aduan" className="sr-only">Cari aduan atau nama pengadu</label>
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="cari-aduan"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari aduan atau nama pengadu..."
              className="w-full rounded-full border border-[#13B8A6] bg-white py-2 pl-8 pr-3 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#13B8A6]/40"
            />
          </div>

          <div>
            <label htmlFor="filter-status" className="sr-only">Filter status</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-full border border-[#13B8A6] bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#13B8A6]/40 md:w-auto"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "Semua" ? "Semua Status" : opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          rows={pageRows}
          emptyText="Tidak ada aduan yang sesuai dengan pencarian."
        />

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={filtered.length}
          perPage={PER_PAGE}
          onChange={setPage}
        />
      </section>

      {/* Modal Buat Aduan / Permohonan Baru */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#F5F7F6] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-[#0F5A6B]">
              Kirim Aduan atau Permohonan Baru
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Sampaikan kendala fasilitas, keamanan, kebersihan, atau usulan surat pengantar RT/RW.
            </p>

            <form onSubmit={handleSubmitAduan} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#26383D]">Jenis Laporan</label>
                  <select
                    value={form.jenis}
                    onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                    className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3 py-2 text-xs text-gray-800 outline-none"
                  >
                    <option value="aduan">Aduan / Masalah</option>
                    <option value="permohonan">Permohonan Layanan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#26383D]">Kategori</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3 py-2 text-xs text-gray-800 outline-none"
                  >
                    <option value="Infrastruktur">Infrastruktur & Jalan</option>
                    <option value="Fasilitas">Fasilitas Umum</option>
                    <option value="Kebersihan">Kebersihan & Sampah</option>
                    <option value="Keamanan">Keamanan Lingkungan</option>
                    <option value="Administrasi">Administrasi RT/RW</option>
                    <option value="Sosial">Kegiatan Warga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Judul Laporan</label>
                <input
                  type="text"
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Lampu penerangan jalan RT 01 mati"
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Lokasi Spesifik (Opsional)</label>
                <input
                  type="text"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  placeholder="Contoh: Dekat Pos Ronda Gang Mawar RT 01"
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Rincian & Keterangan Lengkap</label>
                <textarea
                  rows={4}
                  required
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Jelaskan secara detail masalah atau permohonan Anda (minimal 20 karakter)..."
                  className="w-full rounded-lg border border-[#3CC4B0] bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#3CC4B0]/40"
                />
                <span className="text-[10px] text-gray-500">Panjang karakter: {form.deskripsi.length} (min. 20)</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Foto / Lampiran Pendukung (Opsional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setLampiran(e.target.files[0])}
                  className="w-full text-xs text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-[#13B8A6] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f9b8c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#F7B538] px-5 py-2 text-xs font-bold text-[#0F4C5C] shadow-md transition hover:bg-[#e5a52c] disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "Kirimkan Aduan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
