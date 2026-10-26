import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatRupiah } from "../../utils/formatRupiah";

ChartJS.register(ArcElement, Tooltip, Legend);

const KATEGORI = ["Lingkungan", "Fasilitas", "Kesehatan", "Sosial"];
const WARNA = ["#13B8A6", "#0B5968", "#F4B740", "#8EDDD3"];

// values: array 4 angka sesuai urutan KATEGORI
export default function ExpenseDonutChart({ values = [0, 0, 0, 0] }) {
  const safeValues = Array.isArray(values) && values.length === 4 ? values : [0, 0, 0, 0];
  const total = safeValues.reduce((a, b) => a + Number(b || 0), 0);

  // Jika total 0, gunakan 1 dummy slice transparan agar chart tidak error render
  const chartValues = total > 0 ? safeValues : [1];
  const chartColors = total > 0 ? WARNA : ["#E2E8F0"];
  const chartLabels = total > 0 ? KATEGORI : ["Belum ada data"];

  const data = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors,
        borderColor: "#FFFFFF",
        borderWidth: 2,
        hoverOffset: total > 0 ? 6 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 14,
          font: { size: 11, weight: "bold" },
        },
      },
      tooltip: {
        enabled: total > 0,
        callbacks: {
          label: (ctx) => {
            if (total === 0) return " Belum ada pengeluaran kas";
            const val = ctx.parsed || 0;
            const pct = total ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${formatRupiah(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative flex h-72 items-center justify-center md:h-[21rem]">
      <Doughnut data={data} options={options} />
      {/* Center Label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Total Keluar
        </span>
        <span className="text-sm font-bold text-[#26383D]">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}
