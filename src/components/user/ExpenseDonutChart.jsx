import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatRupiah } from "../../utils/formatRupiah";

ChartJS.register(ArcElement, Tooltip, Legend);

const KATEGORI = ["Lingkungan", "Fasilitas", "Kesehatan", "Sosial"];
const WARNA = ["#13B8A6", "#0B5968", "#F4B740", "#8EDDD3"];

// values: array 4 angka sesuai urutan KATEGORI
export default function ExpenseDonutChart({ values = [0, 0, 0, 0] }) {
  const data = {
    labels: KATEGORI,
    datasets: [
      {
        data: values,
        backgroundColor: WARNA,
        borderColor: "#F5F7F6",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "rectRounded", padding: 14, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${formatRupiah(ctx.parsed)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-72 md:h-[21rem]">
      <Doughnut data={data} options={options} />
    </div>
  );
}