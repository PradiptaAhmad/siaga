import ChartCard from "../user/ChartCard"; // sesuaikan jika ChartCard dipindah ke folder shared
import AduanComparisonChart from "./AduanComparisonChart";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";

export default function AduanComparisonSection({ diterima, ditolak, tahun = 2026 }) {
  return (
    <ChartCard
      icon={iconHeaderGrafik}
      title="Perbandingan Aduan Diterima & Ditolak"
      subtitle={`Rekap aduan dan permohonan warga bulan Januari sampai Desember ${tahun}`}
    >
      <AduanComparisonChart diterima={diterima} ditolak={ditolak} tahun={tahun} />
    </ChartCard>
  );
}