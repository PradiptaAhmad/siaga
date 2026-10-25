import { Lock } from "lucide-react";
import Modal from "./Modal";

export default function KunciVotingModal({ poll, option, onCancel, onConfirm }) {
  return (
    <Modal
      title="Kunci Suara"
      onClose={onCancel}
      layer="z-[110]" // di atas VotingModal
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-semibold text-[#26383D] transition hover:bg-gray-50"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#F4B740] py-2.5 text-xs font-bold text-[#26383D] shadow-sm transition hover:bg-[#e5a52c]"
          >
            Ya, Kunci Suara
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#26383D] text-[#F4B740]">
          <Lock size={22} />
        </div>

        <h3 className="mt-3 text-sm font-bold text-[#26383D]">Kunci pilihan Anda?</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-gray-700">
          Anda memilih <span className="font-bold text-[#26383D]">{option.label}</span> pada
          voting <span className="font-bold text-[#26383D]">“{poll.judul}”</span>.
        </p>

        <p className="mt-3 rounded-lg bg-yellow-100 px-3 py-2 text-[10px] font-medium text-yellow-900">
          Setelah dikunci, suara tidak dapat diubah atau ditarik kembali.
        </p>
      </div>
    </Modal>
  );
}