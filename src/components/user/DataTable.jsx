import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ArrowRight } from "lucide-react";

/**
 * Komponen DataTable Grid Profesional dengan garis kisi (table grid),
 * zebra pattern, alignment pintar, opsi pembatasan data (5/10), dan tombol redirect 'Lihat Selengkapnya'.
 * 
 * @param {Array} columns: [{ key, label, render?: (row, index) => ReactNode, align?: 'left'|'center'|'right', width?: string }]
 * @param {Array} rows: array objek data
 * @param {string} emptyText: pesan ketika data kosong
 * @param {boolean} showFooter: tampilkan summary bar di bawah tabel
 * @param {number} limit: batasi data yang ditampilkan (misal 5 atau 10)
 * @param {string} viewAllUrl: URL navigasi halaman penuh (redirect)
 * @param {string} viewAllText: teks untuk tombol redirect (default: 'Lihat Selengkapnya')
 * @param {string} className: styling tambahan untuk wrapper
 */
export default function DataTable({
  columns = [],
  rows = [],
  emptyText = "Belum ada data.",
  showFooter = true,
  limit,
  viewAllUrl,
  viewAllText = "Lihat Selengkapnya",
  className = "",
}) {
  const [activeLimit, setActiveLimit] = useState(limit || null);

  const getColAlign = (col) => {
    if (col.align) return col.align;
    if (["no", "status", "tanggal", "nik", "jenis_kelamin"].includes(col.key)) {
      return "center";
    }
    if (["jumlah"].includes(col.key)) {
      return "right";
    }
    return "left";
  };

  const getColWidth = (col) => {
    if (col.width) return col.width;
    if (col.key === "no") return "w-14 min-w-[56px]";
    if (col.key === "status") return "w-36 min-w-[120px]";
    if (col.key === "tanggal") return "w-32 min-w-[110px]";
    if (col.key === "jumlah") return "w-36 min-w-[120px]";
    if (col.key === "kategori") return "w-36 min-w-[110px]";
    return "";
  };

  const getAlignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const displayedRows = activeLimit && activeLimit > 0 ? rows.slice(0, activeLimit) : rows;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-xs text-slate-700">
          <thead>
            <tr className="bg-gradient-to-r from-[#E6F4F1] via-[#EEF8F6] to-[#E6F4F1] text-[#0F5A6B]">
              {columns.map((col) => {
                const align = getColAlign(col);
                const width = getColWidth(col);
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`border-b-2 border-[#13B8A6]/40 border-r border-slate-200/80 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider last:border-r-0 select-none ${getAlignClass(
                      align
                    )} ${width}`}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {displayedRows.length > 0 ? (
              displayedRows.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  className="group transition-colors duration-150 odd:bg-white even:bg-[#FAFCFB] hover:bg-[#EAF6F3]/70"
                >
                  {columns.map((col) => {
                    const align = getColAlign(col);
                    const width = getColWidth(col);
                    const isNo = col.key === "no";
                    return (
                      <td
                        key={col.key}
                        className={`border-r border-slate-200/80 px-4 py-3 align-middle text-slate-700 last:border-r-0 ${getAlignClass(
                          align
                        )} ${width} ${
                          isNo ? "font-mono font-semibold text-slate-500 bg-slate-50/40" : ""
                        }`}
                      >
                        {col.render ? col.render(row, index) : row[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Inbox size={22} />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {emptyText}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Data belum tersedia atau belum ada entri terbaru.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar data summary */}
      {showFooter && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/90 bg-[#F8FAFA] px-4 py-2.5 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-700">
              {activeLimit && rows.length > activeLimit
                ? `Menampilkan ${displayedRows.length} dari ${rows.length} Data Terbaru`
                : `Total: ${rows.length} Data Tercatat`}
            </span>

            {/* Quick limit toggle 5 / 10 if rows > 5 */}
            {limit && rows.length > 5 && (
              <div className="inline-flex items-center gap-1 rounded-md bg-slate-200/60 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveLimit(5)}
                  className={`rounded px-2 py-0.5 font-bold transition ${
                    activeLimit === 5
                      ? "bg-white text-[#0F5A6B] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  5 Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLimit(10)}
                  className={`rounded px-2 py-0.5 font-bold transition ${
                    activeLimit === 10
                      ? "bg-white text-[#0F5A6B] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  10 Data
                </button>
                {rows.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setActiveLimit(null)}
                    className={`rounded px-2 py-0.5 font-bold transition ${
                      activeLimit === null
                        ? "bg-white text-[#0F5A6B] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {viewAllUrl && (
              <Link
                to={viewAllUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F5A6B] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0c4756]"
              >
                <span>{viewAllText}</span>
                <ArrowRight size={13} />
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-1.5 font-medium text-emerald-700 text-[10px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Sistem SIAGA Aktif</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
