import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const COLOR_ADA = "#13B8A6";
const COLOR_IKUT = "#F4B740";

// ada & diikuti: array 12 angka (Januari - Desember)
export default function KegiatanChart({ ada = [], diikuti = [], tahun = 2026 }) {
  const data = {
    labels: BULAN,
    datasets: [
      {
        label: "Kegiatan Tersedia",
        data: ada,
        backgroundColor: COLOR_ADA,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.7,
      },
      {
        label: "Kegiatan Diikuti",
        data: diikuti,
        backgroundColor: COLOR_IKUT,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false }, // legend manual agar tidak ikut tergeser
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kegiatan` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, stepSize: 1, precision: 0 },
      },
    },
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#26383D]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_ADA }} />
            Kegiatan Tersedia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_IKUT }} />
            Kegiatan Diikuti
          </span>
        </div>
        <span>Tahun {tahun}</span>
      </div>

      {/* Area yang bisa digeser horizontal di dalam kotak putih */}
      <div className="overflow-x-auto pb-2">
        <div className="relative h-56 min-w-[720px] md:h-64">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}