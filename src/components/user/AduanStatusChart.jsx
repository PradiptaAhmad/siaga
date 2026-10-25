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

const STATUS = [
  { key: "Diterima", color: "#22C55E" },
  { key: "Diproses", color: "#F4B740" },
  { key: "Ditolak", color: "#EF4444" },
];

const sum = (arr) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0);

// series: { Diterima: [12 angka], Diproses: [12 angka], Ditolak: [12 angka] }
export default function AduanStatusChart({ series = {}, tahun = 2026 }) {
  const data = {
    labels: BULAN,
    datasets: STATUS.map((s) => ({
      label: s.key,
      data: series[s.key] || Array(12).fill(0),
      backgroundColor: s.color,
      borderRadius: 3,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} laporan` } },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, stepSize: 1, precision: 0 },
      },
    },
  };

  return (
    <div>
      {/* Legend + tahun */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#26383D]">
        <div className="flex items-center gap-3">
          {STATUS.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.key}
            </span>
          ))}
        </div>
        <span>Tahun {tahun}</span>
      </div>

      {/* Chart (bisa digeser di layar sempit) */}
      <div className="overflow-x-auto pb-2">
        <div className="relative h-64 min-w-[480px] md:h-72">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Ringkasan total per status */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STATUS.map((s) => (
          <div key={s.key} className="rounded-md bg-white px-2 py-2 text-center shadow-sm">
            <p className="text-lg font-bold text-[#26383D]">{sum(series[s.key])}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] font-medium text-gray-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.key}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}