import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * SectionHeader dengan dukungan opsional tombol redirect 'Lihat Selengkapnya'
 */
export default function SectionHeader({
  icon,
  title,
  subtitle,
  to,
  buttonLabel = "Lihat Selengkapnya",
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#13B8A6] px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#26383D]">
          <img src={icon} alt="" className="h-4 w-4 object-contain" />
        </div>
        <div>
          <h2 className="text-sm font-bold leading-tight text-white">{title}</h2>
          <p className="text-[11px] leading-tight text-white">{subtitle}</p>
        </div>
      </div>

      {to && to !== "#" && (
        <Link
          to={to}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#26383D] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1a282c] shrink-0 self-start sm:self-auto"
        >
          <span>{buttonLabel}</span>
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
