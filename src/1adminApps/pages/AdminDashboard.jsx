import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CreditCard, 
  MessageSquareWarning, 
  FileText, 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Users,
  ShieldCheck,
  Plus,
  RefreshCw
} from "lucide-react";

import WelcomeBanner from "../../components/user/AdminWelcomeBanner";
import StatCard from "../../components/user/StatCard";
import SectionHeader from "../../components/user/SectionHeader";
import StatusBadge from "../../components/user/StatusBadge";
import AduanComparisonSection from "../../components/admin/AduanComparisonSection";
import PengumumanCard from "../../components/user/PengumumanCard";
import ChartCard from "../../components/user/ChartCard";
import FinanceBarChart from "../../components/user/FinanceBarChart";
import ExpenseDonutChart from "../../components/user/ExpenseDonutChart";
import DataTable from "../../components/user/DataTable";
import { formatRupiah } from "../../utils/formatRupiah";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import iconHeaderPengumuman from "../../assets/img/UserDashboard/iconHeaderPengumuman.png";
import iconHeaderAduan from "../../assets/img/UserDashboard/HeaderAduan.png";
import iconFamily from "../../assets/img/UserDashboard/IconFamily.png";
import iconIuran from "../../assets/img/UserDashboard/SidebarIuran.png";
import iconVoting from "../../assets/img/UserDashboard/iconHeaderVoting.png";
import iconBadge from "../../assets/img/UserDashboard/StatBadge.png";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";

const DASHBOARD_CACHE_KEY = "siaga_admin_dashboard_cache";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Inisialisasi data dari localStorage cache untuk mencegah glitch/kedipan saat reload
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => !data);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        const res = await api.get("/admin/dashboard");
        if (isMounted && res.data) {
          setData(res.data);
          try {
            localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(res.data));
          } catch (storageErr) {
            console.warn("Gagal menyimpan cache dashboard:", storageErr);
          }
        }
      } catch (err) {
        console.warn("Gagal sinkronisasi data dashboard admin:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchAdminData();
    const timer = setInterval(() => fetchAdminData(false), 20000); // Polling tiap 20 detik

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Hitung angka statistik dari data backend database (tanpa angka dummy palsu)
  const isInitialLoading = loading && !data;

  const totalWarga = data?.stats?.total_warga ?? 0;
  const saldoKas = data?.stats?.saldo_kas ?? 0;
  const kasMasuk = data?.stats?.kas_masuk ?? 0;
  const aduanTotal = data?.stats?.aduan_total ?? 0;
  const aduanPending = data?.stats?.aduan_pending ?? 0;
  const paymentsPending = data?.stats?.payments_pending ?? 0;
  const cctvTotal = data?.stats?.cctv_total ?? 0;
  const cctvOnline = data?.stats?.cctv_online ?? 0;

  const stats = [
    {
      icon: iconFamily,
      title: "Jumlah Warga Terdata",
      subtitle: "Total Warga Terverifikasi di RT/RW",
      value: isInitialLoading ? "..." : `${totalWarga} Warga`,
      badge: "Keluarga Terdaftar",
    },
    {
      icon: iconIuran,
      title: "Total Saldo Kas RT/RW",
      subtitle: "Posisi Keuangan Kas Lingkungan Saat Ini",
      value: isInitialLoading ? "..." : formatRupiah(saldoKas),
      badge: `Pemasukan: ${isInitialLoading ? "..." : formatRupiah(kasMasuk)}`,
    },
    {
      icon: iconHeaderAduan,
      title: "Laporan & Aduan Warga",
      subtitle: "Aduan Masuk yang Memerlukan Penanganan",
      value: isInitialLoading ? "..." : `${aduanTotal} Aduan`,
      badge: aduanPending > 0 ? `${aduanPending} Menunggu Respon` : "Semua Tertangani",
    },
    {
      icon: iconVoting,
      title: "Pemantauan CCTV & Keamanan",
      subtitle: "Status Kamera Pengawas Lingkungan",
      value: isInitialLoading ? "..." : `${cctvOnline} / ${cctvTotal} Online`,
      badge: "Sistem Keamanan Aktif",
    },
  ];

  // List aduan terbaru untuk DataTable langsung dari backend database
  const recentComplaints = (data?.recent_complaints && data.recent_complaints.length > 0)
    ? data.recent_complaints.map((c) => ({
        id: c.id,
        kode: c.kode || `ADU-${c.id}`,
        judul: c.judul,
        pelapor: c.pelapor || (c.user?.name ? `${c.user.name} (RT ${c.user.rt || "004"})` : "Warga"),
        kategori: c.kategori || "Umum",
        prioritas: c.prioritas || "sedang",
        status: c.status || "dikirim",
        tanggal: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }))
    : [];

  const complaintColumns = [
    { key: "no", label: "No.", render: (_row, i) => String(i + 1).padStart(2, "0") },
    {
      key: "kode",
      label: "Kode",
      render: (row) => <span className="font-mono font-bold text-[#0F5A6B]">{row.kode}</span>,
    },
    {
      key: "judul",
      label: "Judul Aduan",
      render: (row) => <span className="font-semibold text-slate-800">{row.judul}</span>,
    },
    {
      key: "pelapor",
      label: "Pelapor",
      render: (row) => <span className="font-medium text-slate-600">{row.pelapor}</span>,
    },
    {
      key: "kategori",
      label: "Kategori",
      render: (row) => (
        <span className="inline-block rounded-full border border-teal-200/70 bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#0F5A6B]">
          {row.kategori}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (row) => (
        <Link
          to="/admin/aduan"
          className="inline-flex items-center gap-1 rounded bg-[#26383D] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#13B8A6]"
        >
          <span>Tanggapi</span>
          <ArrowRight size={11} />
        </Link>
      ),
    },
  ];

  // Data dinamis grafik bulanan dan kategori
  const pemasukanBulanan = data?.monthly_finance?.pemasukan ?? Array(12).fill(0);
  const pengeluaranBulanan = data?.monthly_finance?.pengeluaran ?? Array(12).fill(0);
  const tahunFinansial = data?.monthly_finance?.tahun ?? 2026;

  const expenseCategories = data?.expense_categories ?? [0, 0, 0, 0];

  const complaintsDiterima = data?.complaints_monthly?.diterima ?? Array(12).fill(0);
  const complaintsDitolak = data?.complaints_monthly?.ditolak ?? Array(12).fill(0);
  const tahunAduan = data?.complaints_monthly?.tahun ?? 2026;

  // Data pengumuman dinamis dari backend database
  const announcements = (data?.announcements && data.announcements.length > 0)
    ? data.announcements.map((a) => {
        let tglStr = "2026-10-25";
        if (a.tanggal) {
          tglStr = typeof a.tanggal === "string" ? a.tanggal.split("T")[0] : new Date(a.tanggal).toISOString().split("T")[0];
        }
        return {
          id: a.id,
          nama: a.judul,
          tanggal: tglStr,
          lokasi: a.lokasi || "Balai Pertemuan Lingkungan RT/RW",
          poin: a.pinned ? 15 : 10,
          rincian: a.ringkasan || a.isi || "Agenda rutin kegiatan lingkungan.",
          penanggungJawab: a.penulis || "Pengurus RT/RW",
        };
      })
    : [];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* 1. Header Banner Selamat Datang Admin SIAGA */}
      <WelcomeBanner
        nama={user?.name || "Pengurus RT/RW (Admin)"}
        nomorKK={user?.no_kk || "3513141508219999"}
        status="Pengurus RT/RW Terverifikasi"
      />

      {/* 2. Kartu Statistik Utama (4 Kolom Responsif) */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} badgeIcon={iconBadge} />
        ))}
      </section>

      {/* 3. Pintasan Tindakan Pengurus (Quick Actions) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <Link
          to="/admin/iuran"
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#13B8A6] hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#F4B740] transition group-hover:bg-[#F4B740] group-hover:text-white">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#26383D]">Verifikasi Iuran</p>
            <p className="text-[10px] text-slate-500">
              {paymentsPending > 0 ? (
                <span className="font-bold text-amber-600">{paymentsPending} Menunggu Cek</span>
              ) : (
                "Periksa Bukti Bayar"
              )}
            </p>
          </div>
        </Link>

        <Link
          to="/admin/kas"
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#13B8A6] hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#13B8A6] transition group-hover:bg-[#13B8A6] group-hover:text-white">
            <Plus size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#26383D]">Buku Kas RT/RW</p>
            <p className="text-[10px] text-slate-500">Catat Transaksi</p>
          </div>
        </Link>

        <Link
          to="/admin/aduan"
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#13B8A6] hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition group-hover:bg-rose-500 group-hover:text-white">
            <MessageSquareWarning size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#26383D]">Tindak Aduan</p>
            <p className="text-[10px] text-slate-500">
              {aduanPending > 0 ? (
                <span className="font-bold text-rose-600">{aduanPending} Butuh Respon</span>
              ) : (
                "Daftar Keluhan Warga"
              )}
            </p>
          </div>
        </Link>

        <Link
          to="/admin/keamanan"
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#13B8A6] hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#26383D]">Pantau CCTV</p>
            <p className="text-[10px] text-slate-500">{cctvOnline} Kamera Aktif</p>
          </div>
        </Link>
      </section>

      {/* 4. Grafik Finansial & Pengeluaran (2 Kolom Dinamis Backend) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          icon={iconHeaderGrafik}
          title="Grafik Keuangan Lingkungan"
          subtitle="Perbandingan pemasukan dan pengeluaran kas bulanan dari database"
        >
          <FinanceBarChart 
            pemasukan={pemasukanBulanan} 
            pengeluaran={pengeluaranBulanan} 
            tahun={tahunFinansial} 
          />
        </ChartCard>

        <ChartCard
          icon={iconHeaderGrafik}
          title="Grafik Pengeluaran Kas"
          subtitle="Distribusi alokasi dana berdasarkan kategori program riil"
        >
          <ExpenseDonutChart values={expenseCategories} />
        </ChartCard>
      </section>

      {/* 5. Grafik Perbandingan Aduan & Pengumuman Kegiatan (2 Kolom Dinamis Backend) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AduanComparisonSection 
          diterima={complaintsDiterima} 
          ditolak={complaintsDitolak} 
          tahun={tahunAduan} 
        />

        <ChartCard
          icon={iconHeaderPengumuman}
          title="Pengumuman & Agenda Kegiatan"
          subtitle="Jadwal agenda resmi lingkungan terdekat dari database"
        >
          {announcements.length > 0 ? (
            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {announcements.map((item) => (
                <PengumumanCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <p className="text-xs font-semibold text-slate-600">Belum Ada Pengumuman atau Agenda</p>
              <p className="mt-1 text-[11px] text-slate-400">Pengurus dapat menambahkan agenda baru di menu Pengumuman Resmi.</p>
              <Link
                to="/admin/pengumuman"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#26383D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#13B8A6]"
              >
                <Plus size={14} />
                <span>Buat Pengumuman Baru</span>
              </Link>
            </div>
          )}
        </ChartCard>
      </section>

      {/* 6. Tabel Aduan Warga Terbaru Perlu Penanganan (Dinamis Database) */}
      <section className="space-y-2">
        <SectionHeader
          icon={iconHeaderAduan}
          title="Aduan Warga Terbaru Perlu Penanganan"
          subtitle="Daftar laporan warga yang masuk dan membutuhkan tanggapan pengurus"
          to="/admin/aduan"
          buttonLabel="Kelola Semua Aduan"
        />
        <DataTable
          columns={complaintColumns}
          rows={recentComplaints}
          limit={5}
          emptyText="Belum ada aduan warga baru yang membutuhkan penanganan."
          viewAllUrl="/admin/aduan"
          viewAllText="Buka Halaman Aduan Lengkap"
        />
      </section>
    </div>
  );
}
