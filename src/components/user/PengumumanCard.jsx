const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function PengumumanCard({ nama, tanggal, lokasi, poin, rincian, penanggungJawab }) {
  const [, bulan, hari] = tanggal.split("-");

  return (
    <article className="rounded-md border border-[#26383D] bg-[#F5F7F6] p-2.5">
      <div className="flex gap-3">
        {/* Blok tanggal */}
        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-[#F4B740] text-[#26383D]">
          <span className="text-xl font-bold leading-none">{Number(hari)}</span>
          <span className="mt-1 text-[9px] font-semibold">{BULAN[Number(bulan) - 1]}</span>
        </div>

        {/* Info utama */}
        <div className="min-w-0 flex-1 space-y-0.5 text-[10px] text-[#26383D]">
          <h3 className="text-[11px] font-bold leading-tight">{nama}</h3>
          <p>Lokasi: {lokasi}</p>
          <p>
            Poin Keaktifan: <span className="font-bold">+{poin}</span>
          </p>
        </div>
      </div>

      {/* Rincian & penanggung jawab */}
      <div className="mt-2.5 grid grid-cols-[2fr_1fr] gap-3 border-t border-gray-300 pt-2 text-[9px] text-[#26383D]">
        <div>
          <p className="font-bold">Rincian Kegiatan</p>
          <p className="mt-0.5 leading-relaxed text-gray-700">{rincian}</p>
        </div>
        <div>
          <p className="font-bold">Penanggung Jawab</p>
          <p className="mt-0.5 leading-relaxed text-gray-700">{penanggungJawab}</p>
        </div>
      </div>
    </article>
  );
}