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
const COLOR_DITERIMA = "#22C55E";
const COLOR_DITOLAK = "#EF4444";

const sum = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);

// diterima & ditolak: array 12 angka (Januari - Desember)
export default function AduanComparisonChart({ diterima = [], ditolak = [], tahun = 2026 }) {
  const safeDiterima = Array.isArray(diterima) && diterima.length === 12 ? diterima : Array(12).fill(0);
  const safeDitolak = Array.isArray(ditolak) && ditolak.length === 12 ? ditolak : Array(12).fill(0);

  const totalDiterima = sum(safeDiterima);
  const totalDitolak = sum(safeDitolak);
  const totalSemua = totalDiterima + totalDitolak;
  const persenDiterima = totalSemua ? Math.round((totalDiterima / totalSemua) * 100) : 0;

  const data = {
    labels: BULAN,
    datasets: [
      {
        label: "Diterima",
        data: safeDiterima,
        backgroundColor: COLOR_DITERIMA,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: "Ditolak",
        data: safeDitolak,
        backgroundColor: COLOR_DITOLAK,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} aduan`,
          footer: (items) => `Total: ${items.reduce((s, i) => s + i.parsed.y, 0)} aduan`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, precision: 0 },
      },
    },
  };

  return (
    <div>
      {/* Legend + tahun */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#26383D]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_DITERIMA }} />
            Diterima
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_DITOLAK }} />
            Ditolak
          </span>
        </div>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Januari – Desember {tahun}</span>
      </div>

      {/* Area yang bisa digeser horizontal */}
      <div className="overflow-x-auto pb-2">
        <div className="relative h-64 min-w-[700px] md:h-72">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Ringkasan setahun */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-slate-100 bg-white px-2 py-2 text-center shadow-sm">
          <p className="text-lg font-bold text-[#26383D]">{totalDiterima}</p>
          <p className="flex items-center justify-center gap-1 text-[10px] font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_DITERIMA }} />
            Diterima
          </p>
        </div>
        <div className="rounded-md border border-slate-100 bg-white px-2 py-2 text-center shadow-sm">
          <p className="text-lg font-bold text-[#26383D]">{totalDitolak}</p>
          <p className="flex items-center justify-center gap-1 text-[10px] font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_DITOLAK }} />
            Ditolak
          </p>
        </div>
        <div className="rounded-md border border-slate-100 bg-white px-2 py-2 text-center shadow-sm">
          <p className="text-lg font-bold text-[#26383D]">{persenDiterima}%</p>
          <p className="text-[10px] font-medium text-gray-700">Tingkat Diterima</p>
        </div>
      </div>
    </div>
  );
}
