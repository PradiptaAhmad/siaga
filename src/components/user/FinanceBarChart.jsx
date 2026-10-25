import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { formatRupiah } from "../../utils/formatRupiah";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const COLOR_MASUK = "#13B8A6";
const COLOR_KELUAR = "#F4B740";

// pemasukan & pengeluaran: array 12 angka (Januari - Desember)
export default function FinanceBarChart({ pemasukan = [], pengeluaran = [], tahun = 2026 }) {
  const data = {
    labels: BULAN,
    datasets: [
      {
        label: "Pemasukan",
        data: pemasukan,
        backgroundColor: COLOR_MASUK,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.7,
      },
      {
        label: "Pengeluaran",
        data: pengeluaran,
        backgroundColor: COLOR_KELUAR,
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
      legend: { display: false }, // legend dibuat manual agar tidak ikut ter-scroll
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, callback: (v) => `${v / 1000000} jt` },
      },
    },
  };

  return (
    <div>
      {/* Legend + tahun (tetap di tempat saat chart digeser) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#26383D]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_MASUK }} />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_KELUAR }} />
            Pengeluaran
          </span>
        </div>
        <span>Tahun {tahun}</span>
      </div>

      {/* Area yang bisa digeser horizontal */}
      <div className="overflow-x-auto pb-2">
        <div className="relative h-64 min-w-[800px] md:h-72">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}