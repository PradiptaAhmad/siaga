import { useEffect, useState } from "react";
import WelcomeBanner from "../../components/user/WelcomeBanner";
import StatCard from "../../components/user/StatCard";
import SectionHeader from "../../components/user/SectionHeader";
import DataTable from "../../components/user/DataTable";
import StatusBadge from "../../components/user/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatRupiah } from "../../utils/formatRupiah";

import iconIuranBulanan from "../../assets/img/UserDashboard/StatBulanan.png";
import iconSumbangan from "../../assets/img/UserDashboard/StatSumbangan.png";
import iconPoin from "../../assets/img/UserDashboard/StatPoin.png";
import iconAduanStat from "../../assets/img/UserDashboard/StatAduan.png";
import iconBadge from "../../assets/img/UserDashboard/StatBadge.png";
import iconHeaderAduan from "../../assets/img/UserDashboard/HeaderAduan.png";
import iconHeaderKegiatan from "../../assets/img/UserDashboard/StatBulanan.png";

const aduanColumns = [
  { key: "no", label: "No.", render: (_row, i) => String(i + 1).padStart(2, "0") },
  {
    key: "aduan",
    label: "Aduan / Permohonan",
    render: (row) => <span className="font-semibold text-slate-800">{row.aduan}</span>,
  },
  {
    key: "pengadu",
    label: "Nama Pengadu",
    render: (row) => <span className="font-medium text-slate-600">{row.pengadu}</span>,
  },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const kegiatanColumns = [
  { key: "no", label: "No.", render: (_row, i) => String(i + 1).padStart(2, "0") },
  {
    key: "barang",
    label: "Barang / Kegiatan",
    render: (row) => <span className="font-semibold text-slate-800">{row.barang}</span>,
  },
  {
    key: "kategori",
    label: "Kategori",
    render: (row) => (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-[#0F5A6B] border border-teal-200/70">
        {row.kategori}
      </span>
    ),
  },
  {
    key: "jumlah",
    label: "Jumlah (RP)",
    render: (row) => (
      <span className="font-mono font-bold text-[#0F5A6B]">{row.jumlah}</span>
    ),
  },
  {
    key: "penanggungJawab",
    label: "Penanggung Jawab",
    render: (row) => <span className="text-slate-600 font-medium">{row.penanggungJawab}</span>,
  },
];

export default function UserDashboard() {
  const { user: authUser } = useAuth();

  const [stats, setStats] = useState([
    {
      icon: iconIuranBulanan,
      title: "Iuran Bulanan",
      subtitle: "Jumlah Iuran Bulanan yang Telah Dibayar",
      value: "Rp 0",
      badge: "0 Bulan Terbayar",
    },
    {
      icon: iconSumbangan,
      title: "Sumbangan Sukarela",
      subtitle: "Jumlah Sumbangan Sukarela yang Telah Dibayar",
      value: "Rp 0",
      badge: "0x Dibayar",
    },
    {
      icon: iconPoin,
      title: "Poin Keaktifan Warga",
      subtitle: "Poin dari Partisipasi Kegiatan Warga",
      value: `${authUser?.poin_keaktifan ?? 0} Poin`,
      badge: "Warga Aktif",
    },
    {
      icon: iconAduanStat,
      title: "Aduan / Permohonan",
      subtitle: "Jumlah aduan atau permohonan yang dikirim, diperiksa, diterima",
      value: "0",
    },
  ]);

  const [aduanRows, setAduanRows] = useState([]);
  const [kegiatanRows, setKegiatanRows] = useState([]);

  const displayUser = {
    nama: authUser?.name || "Warga SIAGA",
    nomorKK: authUser?.no_kk || "-",
    status: authUser?.status_akun === "aktif" ? "Verified" : "Aktif",
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const { data } = await api.get('/dashboard');
        if (!isMounted || !data) return;

        if (data.stats) {
          setStats([
            {
              icon: iconIuranBulanan,
              title: "Iuran Bulanan",
              subtitle: "Jumlah Iuran Bulanan yang Telah Dibayar",
              value: formatRupiah(data.stats.iuran_terbayar?.jumlah ?? 0),
              badge: `${data.stats.iuran_terbayar?.bulan ?? 0} Bulan Terbayar`,
            },
            {
              icon: iconSumbangan,
              title: "Sumbangan Sukarela",
              subtitle: "Jumlah Sumbangan Sukarela yang Telah Dibayar",
              value: formatRupiah(data.stats.sumbangan?.jumlah ?? 0),
              badge: `${data.stats.sumbangan?.transaksi ?? 0}x Dibayar`,
            },
            {
              icon: iconPoin,
              title: "Poin Keaktifan Warga",
              subtitle: "Poin dari Partisipasi Kegiatan Warga",
              value: `${data.stats.poin ?? authUser?.poin_keaktifan ?? 0} Poin`,
              badge: "Warga Aktif",
            },
            {
              icon: iconAduanStat,
              title: "Aduan / Permohonan",
              subtitle: "Jumlah aduan atau permohonan yang dikirim, diperiksa, diterima",
              value: String(data.stats.aduan?.total ?? 0),
            },
          ]);
        }

        if (Array.isArray(data.recent_complaints)) {
          setAduanRows(
            data.recent_complaints.map((c, idx) => ({
              id: c.id ?? idx,
              aduan: c.judul,
              pengadu: c.user?.name || displayUser.nama,
              status: c.status === "selesai" ? "Diterima" : c.status === "dikirim" ? "Diproses" : "Diterima",
            }))
          );
        }

        if (Array.isArray(data.announcements)) {
          setKegiatanRows(
            data.announcements.map((a, idx) => ({
              id: a.id ?? idx,
              barang: a.judul,
              kategori: a.kategori || "Kegiatan",
              jumlah: a.anggaran ? formatRupiah(a.anggaran) : "-",
              penanggungJawab: a.penanggung_jawab || a.penulis || "Pengurus RT",
            }))
          );
        }
      } catch (err) {
        console.warn("Gagal memuat data dashboard:", err);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  return (
    <div className="space-y-4 md:space-y-5">
      <WelcomeBanner {...displayUser} />

      {/* Kartu statistik */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} badgeIcon={iconBadge} />
        ))}
      </section>

      {/* Ringkasan aduan */}
      <section className="space-y-1">
        <SectionHeader
          icon={iconHeaderAduan}
          title="Ringkasan Aduan & Permohonan"
          subtitle="Lihat Seluruh Aduan dan Permohonan dari Warga SIAGA Beserta Statusnya"
          to="/user/aduan"
          buttonLabel="Lihat Selengkapnya"
        />
        <DataTable
          columns={aduanColumns}
          rows={aduanRows}
          limit={5}
          viewAllUrl="/user/aduan"
          viewAllText="Lihat Selengkapnya"
          emptyText="Belum ada aduan atau permohonan yang diajukan."
        />
      </section>

      {/* Ringkasan kegiatan / anggaran */}
      <section className="space-y-1">
        <SectionHeader
          icon={iconHeaderKegiatan}
          title="Ringkasan Kegiatan & Anggaran"
          subtitle="Lihat Seluruh Kegiatan dan Penggunaan Dana Lingkungan Warga SIAGA"
          to="/user/aspirasi"
          buttonLabel="Lihat Selengkapnya"
        />
        <DataTable
          columns={kegiatanColumns}
          rows={kegiatanRows}
          limit={5}
          viewAllUrl="/user/aspirasi"
          viewAllText="Lihat Selengkapnya"
          emptyText="Belum ada kegiatan atau anggaran lingkungan tercatat."
        />
      </section>
    </div>
  );
}
