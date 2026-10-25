import { useState } from "react";
import Modal from "./Modal";

// mode "vote"  : pilih opsi lalu lanjut ke konfirmasi kunci suara
// mode "hasil" : tampilkan hasil voting (read-only)
export default function VotingModal({ poll, mode, onClose, onLanjut, closeOnEscape }) {
  const [selected, setSelected] = useState(null);
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  /* ===== Mode hasil ===== */
  if (mode === "hasil") {
    return (
      <Modal
        title="Hasil Voting"
        onClose={onClose}
        closeOnEscape={closeOnEscape}
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#26383D] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1c2a2e]"
          >
            Tutup
          </button>
        }
      >
        <h3 className="text-sm font-bold text-[#26383D]">{poll.judul}</h3>
        {poll.status === "Ditutup" && (
          <p className="mt-1 text-[11px] font-semibold text-gray-600">Voting telah ditutup.</p>
        )}

        <ul className="mt-4 space-y-3">
          {poll.options.map((option) => {
            const pct = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
            const mine = poll.pilihanSaya === option.id;
            return (
              <li key={option.id}>
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#26383D]">
                  <span className="font-semibold">
                    {option.label}
                    {mine && (
                      <span className="ml-2 rounded-full bg-[#13B8A6]/25 px-2 py-0.5 text-[9px] font-bold text-[#0B5968]">
                        Pilihan Anda
                      </span>
                    )}
                  </span>
                  <span className="shrink-0">
                    {option.votes} suara · {pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${mine ? "bg-[#13B8A6]" : "bg-[#26383D]/60"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[10px] text-gray-600">
          Total {totalVotes} suara dari {poll.totalWarga} warga.
        </p>
      </Modal>
    );
  }

  /* ===== Mode beri suara ===== */
  return (
    <Modal
      title="Beri Suara"
      onClose={onClose}
      closeOnEscape={closeOnEscape}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-semibold text-[#26383D] transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => onLanjut(selected)}
            className="flex-1 rounded-lg bg-[#F4B740] py-2.5 text-xs font-bold text-[#26383D] shadow-sm transition hover:bg-[#e5a52c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kunci Pilihan
          </button>
        </>
      }
    >
      <h3 className="text-sm font-bold text-[#26383D]">{poll.judul}</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{poll.deskripsi}</p>

      <fieldset className="mt-4">
        <legend className="text-[11px] font-semibold text-[#26383D]">Pilih salah satu:</legend>
        <div className="mt-2 space-y-2">
          {poll.options.map((option) => {
            const active = selected === option.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium text-[#26383D] transition ${
                  active
                    ? "border-[#13B8A6] bg-[#13B8A6]/10"
                    : "border-gray-300 bg-white hover:border-[#13B8A6]"
                }`}
              >
                <input
                  type="radio"
                  name={`voting-${poll.id}`}
                  value={option.id}
                  checked={active}
                  onChange={() => setSelected(option.id)}
                  className="h-4 w-4 accent-[#13B8A6]"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-3 text-[10px] text-gray-600">
        Satu keluarga memiliki satu suara. Pilihan harus dikunci agar suara dihitung.
      </p>
    </Modal>
  );
}