import { formatTanggal } from "../../utils/formatTanggal";

const badgeStyle = {
  Berlangsung: { wrap: "bg-green-200 text-green-900", dot: "bg-green-500" },
  "Suara Terkunci": { wrap: "bg-[#13B8A6]/25 text-[#0B5968]", dot: "bg-[#13B8A6]" },
  Ditutup: { wrap: "bg-gray-200 text-gray-700", dot: "bg-gray-500" },
};

export function getVotingState(poll) {
  if (poll.status === "Ditutup") return "Ditutup";
  if (poll.terkunci) return "Suara Terkunci";
  return "Berlangsung";
}

// onAction(pollId, mode) -> mode: "vote" | "hasil"
export default function VotingCard({ poll, onAction }) {
  const state = getVotingState(poll);
  const style = badgeStyle[state];

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const pct = poll.totalWarga ? Math.round((totalVotes / poll.totalWarga) * 100) : 0;
  const pilihan = poll.options.find((o) => o.id === poll.pilihanSaya);
  const bisaMemilih = state === "Berlangsung";

  return (
    <article className="rounded-lg border border-[#26383D] bg-[#F5F7F6] p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-bold leading-tight text-[#26383D]">{poll.judul}</h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-0.5 text-[9px] font-medium ${style.wrap}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {state}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-gray-600">{poll.deskripsi}</p>

      {pilihan && (
        <p className="mt-2 text-[10px] text-[#26383D]">
          Pilihan Anda: <span className="font-bold">{pilihan.label}</span>
        </p>
      )}

      <p className="mt-3 text-[9px] font-semibold italic text-[#26383D]">
        Partisipasi: {totalVotes} dari {poll.totalWarga} warga ({pct}%)
      </p>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-[#13B8A6]" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium text-[#26383D]">
          Batas: {formatTanggal(poll.batas)}
        </span>
        <button
          type="button"
          onClick={() => onAction(poll.id, bisaMemilih ? "vote" : "hasil")}
          className={`rounded-md px-3 py-1.5 text-[10px] font-semibold shadow-sm transition ${
            bisaMemilih
              ? "bg-[#F4B740] text-[#26383D] hover:bg-[#e5a52c]"
              : "bg-[#26383D] text-white hover:bg-[#1c2a2e]"
          }`}
        >
          {bisaMemilih ? "Beri Suara" : "Lihat Hasil"}
        </button>
      </div>
    </article>
  );
}