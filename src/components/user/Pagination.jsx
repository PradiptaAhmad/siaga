import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, perPage, onChange }) {
  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md bg-[#26383D] text-white transition hover:bg-[#1c2a2e] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-2 rounded-lg bg-[#F5F7F6] px-3 py-2 shadow-md sm:flex-row">
      <p className="text-[11px] text-gray-700">
        Menampilkan <span className="font-bold">{from}–{to}</span> dari{" "}
        <span className="font-bold">{total}</span> aduan
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[11px] font-semibold text-[#26383D]">
          Halaman {page} dari {totalPages}
        </span>
        <button type="button" className={btn} disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}