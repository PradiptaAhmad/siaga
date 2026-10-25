import { useEffect, useState } from "react";
import { CreditCard, Upload, CheckCircle2, AlertCircle, X, Heart, ShieldCheck, Clock } from "lucide-react";
import Swal from "sweetalert2";
import PageBanner from "../../components/user/PageBanner";
import StatCard from "../../components/user/StatCard";
import ChartCard from "../../components/user/ChartCard";
import FinanceBarChart from "../../components/user/FinanceBarChart";
import ExpenseDonutChart from "../../components/user/ExpenseDonutChart";
import SectionHeader from "../../components/user/SectionHeader";
import DataTable from "../../components/user/DataTable";
import StatusBadge from "../../components/user/StatusBadge";
import { formatRupiah } from "../../utils/formatRupiah";
import { formatTanggal } from "../../utils/formatTanggal";
import api, { getErrorMessage } from "../../lib/api";
import { openSnapPayment } from "../../lib/midtrans";
import { useAuth } from "../../context/AuthContext";

import iconJumlahIuran from "../../assets/img/UserDashboard/iconJumlahIuran.png";
import iconIuranBulanIni from "../../assets/img/UserDashboard/iconIuranBulanIni.png";
import iconPengeluaran from "../../assets/img/UserDashboard/iconPengeluaran.png";
import iconStatusIuran from "../../assets/img/UserDashboard/iconStatusIuran.png";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";
import iconHeaderKegiatan from "../../assets/img/UserDashboard/iconHeaderKegiatan.png";

const paymentColumns = [
  { key: "no", label: "No.", render: (_row, i) => String(i + 1).padStart(2, "0") },
  {
    key: "tanggal",
    label: "Tanggal",
    render: (row) => (row.tanggal ? formatTanggal(row.tanggal.slice(0, 10)) : "-"),
  },
  {
    key: "jenis",
    label: "Jenis",
    render: (row) => (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          row.jenis === "sumbangan"
            ? "bg-amber-100 text-amber-800 border border-amber-200"
            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
        }`}
      >
        {row.jenis === "sumbangan" ? "Donasi Sukarela" : "Iuran Bulanan"}
      </span>
    ),
  },
  {
    key: "keterangan",
    label: "Uraian / Keterangan",
    render: (row) => (
      <span className="font-medium text-[#26383D]">
        {row.keterangan || (row.jenis === "sumbangan" ? "Donasi Warga" : "Iuran Warga")}
      </span>
    ),
  },
  {
    key: "jumlah",
    label: "Jumlah (RP)",
    render: (row) => (
      <span className="font-mono font-bold text-[#0F5A6B]">
        {formatRupiah(row.jumlah)}
      </span>
    ),
  },
  {
    key: "metode",
    label: "Metode",
    render: (row) => (
      <span className="capitalize font-mono text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
        {row.metode === "midtrans" ? "Midtrans Snap (QRIS/VA)" : row.metode || "Transfer Bank"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const isLunas = row.status === "terverifikasi" || row.status === "lunas";
      const isMenunggu = row.status === "menunggu";
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isLunas
              ? "bg-green-100 text-green-800"
              : isMenunggu
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isLunas ? "Lunas Terverifikasi" : isMenunggu ? "Menunggu Verifikasi" : "Ditolak"}
        </span>
      );
    },
  },
];

export default function IuranKeuangan() {
  const { user } = useAuth();

  const [totalDibayarSaya, setTotalDibayarSaya] = useState(0);
  const [totalDonasiSaya, setTotalDonasiSaya] = useState(0);
  const [pengeluaranKasRT, setPengeluaranKasRT] = useState(0);

  const [statusIuran, setStatusIuran] = useState({
    periode: "Memuat tagihan...",
    lunas: false,
    id: null,
    jumlah: 150000,
  });

  const [userPayments, setUserPayments] = useState([]);
  const [pemasukan, setPemasukan] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [pengeluaran, setPengeluaran] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [pengeluaranKategori, setPengeluaranKategori] = useState([0, 0, 0, 0]);

  // Modal Pembayaran Iuran Bulanan
  const [payIuranModal, setPayIuranModal] = useState(false);
  const [iuranPayMethod, setIuranPayMethod] = useState("midtrans"); // 'midtrans' | 'manual'
  const [iuranLoading, setIuranLoading] = useState(false);
  const [iuranBukti, setIuranBukti] = useState(null);
  const [iuranKeterangan, setIuranKeterangan] = useState("");

  // Modal Donasi / Sumbangan Sukarela
  const [donationModal, setDonationModal] = useState(false);
  const [donationMethod, setDonationMethod] = useState("midtrans");
  const [donationAmount, setDonationAmount] = useState(50000);
  const [donationKeterangan, setDonationKeterangan] = useState("Donasi Kas Sosial & Kegiatan Lingkungan");
  const [donationLoading, setDonationLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [resIuran, resKas] = await Promise.allSettled([
        api.get("/iuran"),
        api.get("/kas"),
      ]);

      if (resIuran.status === "fulfilled" && resIuran.value?.data) {
        const iuranData = resIuran.value.data;
        const summary = iuranData.summary || {};

        setTotalDibayarSaya(summary.total_dibayar || 0);
        setTotalDonasiSaya(summary.total_donasi || 0);

        const iurans = iuranData.iurans || [];
        const currentIuran = iurans[0];
        if (currentIuran) {
          setStatusIuran({
            id: currentIuran.id,
            periode: `${currentIuran.periode || "Bulan Ini"} · ${formatRupiah(currentIuran.jumlah || 150000)}`,
            lunas: currentIuran.status === "lunas",
            jumlah: currentIuran.jumlah || 150000,
          });
        }

        // Record Pembayaran User (Private data of the logged-in user)
        if (Array.isArray(iuranData.payments)) {
          setUserPayments(iuranData.payments);
        }
      }

      if (resKas.status === "fulfilled" && resKas.value?.data) {
        const kasData = resKas.value.data;
        if (kasData.summary) {
          setPengeluaranKasRT(kasData.summary.total_keluar || 0);
        }

        if (Array.isArray(kasData.chart) && kasData.chart.length > 0) {
          const chartPemasukan = Array(12).fill(0);
          const chartPengeluaran = Array(12).fill(0);
          kasData.chart.forEach((item, idx) => {
            if (idx < 12) {
              chartPemasukan[idx] = Number(item.masuk) || 0;
              chartPengeluaran[idx] = Number(item.keluar) || 0;
            }
          });
          setPemasukan(chartPemasukan);
          setPengeluaran(chartPengeluaran);
        }

        if (Array.isArray(kasData.transactions)) {
          const keluarTrx = kasData.transactions.filter((t) => t.jenis === "keluar");
          const catMap = {};
          keluarTrx.forEach((t) => {
            const cat = t.kategori || "Lainnya";
            catMap[cat] = (catMap[cat] || 0) + Number(t.jumlah || 0);
          });
          const catValues = Object.values(catMap);
          if (catValues.length > 0) {
            setPengeluaranKategori(catValues);
          }
        }
      }
    } catch (e) {
      console.warn("Gagal memuat data keuangan warga:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Bayar Iuran Bulanan
  const handlePayIuran = async (e) => {
    e.preventDefault();
    setIuranLoading(true);

    try {
      if (iuranPayMethod === "midtrans") {
        if (!statusIuran.id) {
          throw new Error("Data tagihan iuran belum tersedia.");
        }

        const { data } = await api.post(`/midtrans/iuran/${statusIuran.id}`);
        if (!data.snap_token) {
          throw new Error("Gagal menghubungkan ke Midtrans.");
        }

        await openSnapPayment(data.snap_token, {
          onSuccess: async () => {
            if (data.order_id) {
              try {
                await api.post(`/midtrans/finish/${data.order_id}`);
              } catch (_) {}
            }
            Swal.fire({
              icon: "success",
              title: "Pembayaran Iuran Berhasil!",
              text: `Iuran sebesar ${formatRupiah(statusIuran.jumlah)} telah lunas diverifikasi otomatis oleh Midtrans.`,
              confirmButtonColor: "#0F5A6B",
            });
            setPayIuranModal(false);
            fetchData();
          },
          onPending: () => {
            Swal.fire({
              icon: "info",
              title: "Menunggu Pembayaran",
              text: "Silakan selesaikan pembayaran sesuai instruksi QRIS/Virtual Account yang dipilih.",
              confirmButtonColor: "#0F5A6B",
            });
            setPayIuranModal(false);
            fetchData();
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Pembayaran Gagal",
              text: "Transaksi dibatalkan atau terjadi kesalahan di gateway Midtrans.",
              confirmButtonColor: "#0F5A6B",
            });
          },
        });
      } else {
        // Transfer Manual
        if (!statusIuran.id) {
          throw new Error("Data tagihan belum tersedia.");
        }
        const formData = new FormData();
        formData.append("metode", "transfer");
        if (iuranBukti) formData.append("bukti", iuranBukti);
        if (iuranKeterangan) formData.append("keterangan", iuranKeterangan);

        await api.post(`/iuran/${statusIuran.id}/bayar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          icon: "success",
          title: "Bukti Transfer Terkirim!",
          text: "Pengurus RT akan segera memverifikasi pembayaran iuran Anda.",
          confirmButtonColor: "#0F5A6B",
        });
        setPayIuranModal(false);
        fetchData();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Memproses",
        text: getErrorMessage(err) || "Gagal memproses pembayaran.",
        confirmButtonColor: "#0F5A6B",
      });
    } finally {
      setIuranLoading(false);
    }
  };

  // Handle Bayar Donasi / Sumbangan Sukarela
  const handlePayDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || donationAmount < 5000) {
      Swal.fire({
        icon: "warning",
        title: "Nominal Minimal",
        text: "Nominal donasi minimal Rp 5.000.",
        confirmButtonColor: "#0F5A6B",
      });
      return;
    }

    setDonationLoading(true);

    try {
      if (donationMethod === "midtrans") {
        const { data } = await api.post("/midtrans/donation", {
          jumlah: Number(donationAmount),
          keterangan: donationKeterangan || "Donasi Sukarela Warga",
        });

        if (!data.snap_token) {
          throw new Error("Gagal mendapatkan token Midtrans.");
        }

        await openSnapPayment(data.snap_token, {
          onSuccess: async () => {
            if (data.order_id) {
              try {
                await api.post(`/midtrans/finish/${data.order_id}`);
              } catch (_) {}
            }
            Swal.fire({
              icon: "success",
              title: "Terima Kasih atas Donasi Anda!",
              text: `Donasi sebesar ${formatRupiah(donationAmount)} telah diterima dan tercatat di kas lingkungan. (+5 Poin Keaktifan)`,
              confirmButtonColor: "#0F5A6B",
            });
            setDonationModal(false);
            fetchData();
          },
          onPending: () => {
            Swal.fire({
              icon: "info",
              title: "Menunggu Pembayaran",
              text: "Silakan selesaikan donasi Anda.",
              confirmButtonColor: "#0F5A6B",
            });
            setDonationModal(false);
            fetchData();
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Donasi Dibatalkan",
              text: "Transaksi donasi dibatalkan.",
              confirmButtonColor: "#0F5A6B",
            });
          },
        });
      } else {
        // Manual Transfer Upload (Bisa langsung transfer dengan konfirmasi)
        Swal.fire({
          icon: "info",
          title: "Transfer Rekening Donasi",
          html: `<p>Silakan transfer donasi ke:</p><p class="font-bold text-lg text-[#0F5A6B] my-2">BCA: 873-091-2384</p><p class="text-xs text-gray-500">a.n. Bendahara Kas SIAGA</p><p class="text-xs mt-2">Kirim bukti via WhatsApp ke pengurus RT untuk pencatatan.</p>`,
          confirmButtonColor: "#0F5A6B",
        });
        setDonationModal(false);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Memproses Donasi",
        text: getErrorMessage(err) || "Gagal membuka jalur donasi.",
        confirmButtonColor: "#0F5A6B",
      });
    } finally {
      setDonationLoading(false);
    }
  };

  const statCards = [
    {
      icon: iconJumlahIuran,
      title: "Total Iuran Saya Terbayar",
      subtitle: "Akumulasi iuran bulanan yang telah lunas",
      value: formatRupiah(totalDibayarSaya),
    },
    {
      icon: iconIuranBulanIni,
      title: "Total Donasi Sukarela",
      subtitle: "Akumulasi sumbangan yang telah disalurkan",
      value: formatRupiah(totalDonasiSaya),
    },
    {
      icon: iconPengeluaran,
      title: "Pengeluaran Kas Lingkungan",
      subtitle: "Total penggunaan kas RT bulan ini",
      value: formatRupiah(pengeluaranKasRT),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <PageBanner
        title="Iuran Bulanan & Keuangan Warga"
        subtitle="Kelola pembayaran uang bulanan keluarga, salurkan donasi sukarela, dan pantau catatan pembayaran pribadi Anda."
      />

      {/* 4 Stat Card */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {statCards.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}

        <StatCard
          icon={iconStatusIuran}
          title="Status Iuran Bulan Ini"
          subtitle={statusIuran.periode}
        >
          <div className="space-y-2 mt-1">
            {statusIuran.lunas ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">
                <CheckCircle2 size={13} /> Lunas Terverifikasi
              </span>
            ) : (
              <div>
                <p className="text-[11px] font-bold text-rose-600">
                  Tagihan Belum Lunas
                </p>
                <button
                  type="button"
                  onClick={() => setPayIuranModal(true)}
                  className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#0F5A6B] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#0c4756]"
                >
                  <CreditCard size={13} />
                  <span>Bayar Sekarang (Midtrans)</span>
                </button>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setDonationModal(true)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0F5A6B] hover:underline"
              >
                <Heart size={12} className="text-rose-500 fill-rose-500" />
                <span>+ Salurkan Donasi / Sumbangan</span>
              </button>
            </div>
          </div>
        </StatCard>
      </section>

      {/* Aksi Pembayaran & Donasi Banner Bar */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0F5A6B]/10 text-[#0F5A6B] flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0F5A6B]">
              Layanan Pembayaran Midtrans Snap Resmi
            </h4>
            <p className="text-[11px] text-gray-500">
              Uang bulanan keluarga standar <strong>Rp 150.000 / bulan</strong> (dapat disesuaikan oleh admin RT). Didukung QRIS, GoPay, OVO, ShopeePay & Virtual Account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setPayIuranModal(true)}
            className="flex-1 sm:flex-initial rounded-lg bg-[#0F5A6B] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c4756] flex items-center justify-center gap-1.5"
          >
            <CreditCard size={14} />
            <span>Bayar Iuran Bulanan</span>
          </button>
          <button
            type="button"
            onClick={() => setDonationModal(true)}
            className="flex-1 sm:flex-initial rounded-lg bg-[#F7B538] px-4 py-2 text-xs font-bold text-[#0F5A6B] shadow-sm transition hover:bg-[#e2a229] flex items-center justify-center gap-1.5"
          >
            <Heart size={14} className="fill-[#0F5A6B]" />
            <span>Kirim Donasi</span>
          </button>
        </div>
      </section>

      {/* Grafik */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          icon={iconHeaderGrafik}
          title="Grafik Keuangan Lingkungan"
          subtitle="Perbandingan pemasukan dan pengeluaran bulanan kas RT"
        >
          <FinanceBarChart pemasukan={pemasukan} pengeluaran={pengeluaran} tahun={new Date().getFullYear()} />
        </ChartCard>

        <ChartCard
          icon={iconHeaderGrafik}
          title="Grafik Pengeluaran Iuran"
          subtitle="Perbandingan pengeluaran kas lingkungan berdasarkan kategori"
        >
          <ExpenseDonutChart values={pengeluaranKategori} />
        </ChartCard>
      </section>

      {/* Record Pembayaran User (Pribadi & Terenkripsi) */}
      <section className="space-y-1">
        <SectionHeader
          icon={iconHeaderKegiatan}
          title="Record Pembayaran Saya"
          subtitle="Riwayat pembayaran iuran bulanan dan donasi pribadi Anda (sifatnya pribadi dan terenkripsi)"
        />
        <DataTable
          columns={paymentColumns}
          rows={userPayments}
          limit={10}
          emptyText="Anda belum memiliki riwayat transaksi pembayaran iuran atau donasi."
        />
      </section>

      {/* Modal 1: Bayar Iuran Bulanan */}
      {payIuranModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-[#F5F7F6] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setPayIuranModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-[#0F5A6B]">
              Bayar Uang Iuran Bulanan
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Periode Tagihan: <span className="font-semibold text-gray-900">{statusIuran.periode}</span>
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIuranPayMethod("midtrans")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  iuranPayMethod === "midtrans"
                    ? "bg-[#0F5A6B] text-white shadow-md"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                Midtrans QRIS / VA (Otomatis)
              </button>
              <button
                type="button"
                onClick={() => setIuranPayMethod("manual")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  iuranPayMethod === "manual"
                    ? "bg-[#0F5A6B] text-white shadow-md"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                Transfer Manual
              </button>
            </div>

            <form onSubmit={handlePayIuran} className="mt-4 space-y-3">
              {iuranPayMethod === "midtrans" ? (
                <div className="rounded-xl border border-[#3CC4B0]/40 bg-white p-4 text-xs text-gray-700 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Nominal Tagihan:</span>
                    <span className="font-mono font-bold text-sm text-[#0F5A6B]">
                      {formatRupiah(statusIuran.jumlah)}
                    </span>
                  </div>
                  <p className="font-semibold text-[#0F5A6B]">Verifikasi Instan via Gateway Midtrans</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Mendukung pembayaran via QRIS (GoPay, OVO, Dana, ShopeePay), serta Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata). Status tagihan langsung lunas otomatis.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
                    <p className="font-bold text-[#26383D]">Rekening Kas RT 04 / RW 02:</p>
                    <p className="font-mono text-sm font-bold text-[#0F5A6B]">BCA: 873-091-2384</p>
                    <p className="text-[10px] text-gray-500">a.n. Bendahara Kas SIAGA</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#26383D]">Upload Struk / Bukti Transfer</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setIuranBukti(e.target.files[0])}
                      className="w-full text-xs text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-[#13B8A6] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f9b8c]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#26383D]">Keterangan (Opsional)</label>
                    <input
                      type="text"
                      value={iuranKeterangan}
                      onChange={(e) => setIuranKeterangan(e.target.value)}
                      placeholder="Misal: Iuran bulan Oktober keluarga saya"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={iuranLoading}
                className="mt-4 w-full rounded-full bg-[#0F5A6B] py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0c4756] disabled:opacity-50"
              >
                {iuranLoading ? "Memproses..." : iuranPayMethod === "midtrans" ? `Bayar ${formatRupiah(statusIuran.jumlah)} via Midtrans` : "Kirim Bukti Pembayaran"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Salurkan Donasi / Sumbangan Sukarela */}
      {donationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-[#F5F7F6] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setDonationModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-[#0F5A6B]">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              <h3 className="text-base font-bold">Salurkan Donasi Warga</h3>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Sumbangan sukarela untuk kas sosial, perbaikan fasilitas mendesak, santunan, atau kegiatan RT/RW.
            </p>

            <form onSubmit={handlePayDonation} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Pilih Nominal Donasi Cepat</label>
                <div className="grid grid-cols-4 gap-2">
                  {[25000, 50000, 100000, 200000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setDonationAmount(nom)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                        donationAmount === nom
                          ? "bg-[#0F5A6B] text-white border-[#0F5A6B] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {nom / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Atau Masukkan Nominal Bebas (Rp)</label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  required
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  placeholder="Contoh: 75000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0F5A6B]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#26383D]">Peruntukan / Keterangan Donasi</label>
                <input
                  type="text"
                  required
                  value={donationKeterangan}
                  onChange={(e) => setDonationKeterangan(e.target.value)}
                  placeholder="Contoh: Donasi kegiatan kerja bakti atau santunan warga"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#0F5A6B]"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600">
                <p className="font-semibold text-[#0F5A6B]">Metode Donasi: Midtrans Gateway</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Pembayaran otomatis via Midtrans QRIS/E-Wallet langsung dicatat pada pembukuan kas masuk RT dan menambahkan +5 Poin Keaktifan Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={donationLoading}
                className="mt-4 w-full rounded-full bg-[#F7B538] py-2.5 text-xs font-bold text-[#0F5A6B] shadow-md transition hover:bg-[#e2a229] disabled:opacity-50"
              >
                {donationLoading ? "Menghubungkan ke Midtrans..." : `Donasikan ${formatRupiah(donationAmount)} Sekarang`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
