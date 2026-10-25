import StatusBadge from "./StatusBadge";
import { formatTanggal } from "../../utils/formatTanggal";

const barColor = {
  Diterima: "bg-[#13B8A6]",
  Diproses: "bg-[#F4B740]",
  Ditolak: "bg-red-500",
};

export default function AduanCard({ judul, deskripsi, tanggal, status, progress }) {
  return (
    <article className="rounded-lg border border-[#26383D] bg-[#F5F7F6] p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-bold leading-tight text-[#26383D]">{judul}</h3>
        <StatusBadge status={status} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-gray-600">{deskripsi}</p>

      <p className="mt-3 text-[9px] italic font-semibold text-[#26383D]">Progress</p>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${barColor[status] ?? "bg-gray-400"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#26383D]">
        <span className="font-medium">{formatTanggal(tanggal)}</span>
      </div>
    </article>
  );
}
