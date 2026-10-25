import WelcomeBanner from "../../components/user/AdminWelcomeBanner";
import StatCard from "../../components/user/StatCard";
import SectionHeader from "../../components/user/SectionHeader";
import StatusBadge from "../../components/user/StatusBadge";
import AduanComparisonSection from "../../components/admin/AduanComparisonSection";
import PengumumanCard from "../../components/user/PengumumanCard";
import iconHeaderPengumuman from "../../assets/img/UserDashboard/iconHeaderPengumuman.png";

import { Link } from "react-router-dom";
import PageBanner from "../../components/user/PageBanner";
import ChartCard from "../../components/user/ChartCard";
import FinanceBarChart from "../../components/user/FinanceBarChart";
import ExpenseDonutChart from "../../components/user/ExpenseDonutChart";
import DataTable from "../../components/user/DataTable";
import { formatRupiah } from "../../utils/formatRupiah";

import iconHeaderAduan from "../../assets/img/UserDashboard/HeaderAduan.png";
import iconFamily from "../../assets/img/UserDashboard/iconFamily.png";
import iconIuran from "../../assets/img/UserDashboard/SidebarIuran.png";
import iconVoting from "../../assets/img/UserDashboard/iconHeaderVoting.png";
import iconBadge from "../../assets/img/UserDashboard/StatBadge.png";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";




    // Januari - Desember 2026
    const diterima = [4, 6, 5, 8, 7, 9, 6, 10, 8, 11, 0, 0];
    const ditolak  = [1, 2, 1, 2, 3, 1, 2, 2, 1, 3, 0, 0];

    <AduanComparisonSection diterima={diterima} ditolak={ditolak} tahun={2026} />
    // Januari - Desember 2026 (dalam rupiah)
    const pemasukan = [3500000, 3600000, 3700000, 3750000, 3800000, 3700000, 3750000, 3800000, 3700000, 3750000, 0, 0];
    const pengeluaran = [1200000, 2000000, 1500000, 2400000, 1800000, 1300000, 2200000, 1600000, 1900000, 1250000, 0, 0];

    // Urutan: Lingkungan, Fasilitas, Kesehatan, Sosial
    const pengeluaranKategori = [450000, 400000, 250000, 150000];

    const user = {
    nama: "Suparman Hadi",
    nomorKK: "3521********",
    status: "Verified",
    };

    const stats = [
    {
        icon: iconFamily,
        title: "Jumlah Warga Aktif",
        subtitle: "Jumlah Warga Aktif di Desa CrazyKiller",
        value: "221 Warga",
        badge: "42 Akun SIAGA",
    },
    {
        icon: iconIuran,
        title: "Jumlah Iuran Bulanan",
        subtitle: "Jumlah Iuran Bulanan yang Telah Dibayar",
        value: "Rp. 2.200.000",
        badge: "8 Pengeluaran Bulan Ini",
    },
    {
        icon: iconHeaderAduan,
        title: "Jumlah Aduan Warga",
        subtitle: "Seluruh Aduan Warga yang Belum Selesai atau Dalam Progress",
        value: "6 Aduan",
        badge: "2 Selesai Bulan Ini",
    },
    {
        icon: iconVoting,
        title: "Total Voting & Kegiatan",
        subtitle: "Jumlah Voting atau Kegiatan yang Dapat Diikuti Warga",
        value: "12",
        badge: "3 Voting, 9 Kegiatan"
    },
    ];

    const pengumuman = [
    {
        id: 1,
        nama: "Kerja Bakti Bulanan",
        tanggal: "2026-11-08",
        lokasi: "Balai RT 01",
        poin: 10,
        rincian: "Membersihkan selokan dan taman lingkungan. Mohon membawa alat kebersihan masing-masing.",
        penanggungJawab: "Slamet Riyadi",
    },
    {
        id: 2,
        nama: "Posyandu Balita & Lansia",
        tanggal: "2026-11-22",
        lokasi: "Pos Posyandu RW 02",
        poin: 5,
        rincian: "Pemeriksaan kesehatan rutin, penimbangan balita, dan pemberian vitamin.",
        penanggungJawab: "Afifah Khusna",
    },
    {
        id: 3,
        nama: "Rapat Evaluasi Akhir Tahun",
        tanggal: "2026-12-14",
        lokasi: "Aula RW 01",
        poin: 15,
        rincian: "Evaluasi program lingkungan selama 2026 dan penyusunan rencana tahun depan.",
        penanggungJawab: "Budiono Siregar",
    },
    ];

export default function AdminDashboard(){
    
    return(
        <>
        <div className="space-y-4 md:space-y-5">
            <WelcomeBanner {...user} />

            {/* Kartu statistik: mobile 1 kolom | tablet 2 kolom | desktop 4 kolom */}
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
                    {stats.map((item) => (
                      <StatCard key={item.title} {...item} badgeIcon={iconBadge} />
                    ))}
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard
                    icon={iconHeaderGrafik}
                    title="Grafik Keuangan Lingkungan"
                    subtitle="Perbandingan pemasukan dan pengeluaran bulanan"
                >
                    <FinanceBarChart pemasukan={pemasukan} pengeluaran={pengeluaran} tahun={2026} />
                </ChartCard>
        
                <ChartCard
                    icon={iconHeaderGrafik}
                    title="Grafik Pengeluaran Iuran"
                    subtitle="Perbandingan pengeluaran berdasarkan kategori"
                >
                    <ExpenseDonutChart values={pengeluaranKategori} />
                </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AduanComparisonSection diterima={diterima} ditolak={ditolak} tahun={2026} />

                <ChartCard
                    icon={iconHeaderPengumuman}
                    title="Pengumuman Kegiatan"
                    subtitle="Lihat pengumuman kegiatan lingkungan terbaru"
                    >
                    <div className="max-h-full space-y-3 overflow-y-auto pr-1">
                        {pengumuman.length === 0 ? (
                        <p className="py-10 text-center text-xs text-gray-500">
                            Belum ada pengumuman kegiatan.
                        </p>
                        ) : (
                        pengumuman.map((item) => <PengumumanCard key={item.id} {...item} />)
                        )}
                    </div>
                </ChartCard>
            </section>
        </div>
        </>
    )
}