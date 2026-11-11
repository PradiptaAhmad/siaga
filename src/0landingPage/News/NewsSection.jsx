import { ArrowUpRight } from "lucide-react";
import berita1 from "../../assets/img/News/berita1.jpg"; // gambar berita Portal Tiga
import berita2 from "../../assets/img/News/berita2.jpeg"; // gambar berita detikJateng

const news = [
  {
    id: 1,
    gambar: berita1,
    sumber: "Portal Tiga",
    tanggal: "", // isi jika ingin menampilkan tanggal, contoh: "12 Maret 2025"
    judul: "Warga Kalisari Tuntut Transparansi Dana Iuran RT",
    ringkasan:
      "Warga Kalisari menggugat pengurus RT dan meminta agar pengelolaan dana iuran warga dilakukan secara lebih transparan.",
    relevansi:
      "Laporan kas yang terbuka sejak awal membantu mencegah kecurigaan dan konflik antarwarga.",
    url: "https://www.portaltiga.com/baca-15195-warga-kalisari-gugat-rt-agar-lebih-transparan-kelola-dana-iuran-warga",
  },
  {
    id: 2,
    gambar: berita2,
    sumber: "detikJateng",
    tanggal: "5 Februari 2025",
    judul: "Dugaan Penggelapan APBDes Rp 550 Juta di Sukoharjo",
    ringkasan:
      "Bendahara Desa Bakalan, Polokarto, diduga menarik dana APBDes 2024 sekitar Rp550 juta untuk keperluan pribadi. Kasus ini ramai setelah diunggah warga di media sosial, dan menurut camat dana tersebut sudah dikembalikan ke kas desa. Dugaan bahwa uang itu dipakai untuk judi online masih didalami polisi.",
    relevansi:
      "Kasus ini terjadi di tingkat desa, tetapi pelajarannya sama: catatan keuangan yang terbuka membuat kejanggalan lebih cepat terlihat.",
    url: "https://www.detik.com/jateng/berita/d-7764375/ramai-bendahara-desa-di-sukoharjo-diduga-tilep-apbdes-rp-550-juta-untuk-judol",
  },
];

export default function NewsSection() {
  return (
    <section
      id="berita"
      className="w-full scroll-mt-16 bg-[#F5F7F6] md:scroll-mt-[72px]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20 lg:px-[110px] lg:py-24">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-2xl bg-[#BFE3DA] px-4 py-1.5 text-[10px] font-semibold text-[#0F5A6B] md:rounded-full md:text-[11px]">
            📰 Berita Pendukung
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#0F5A6B] md:text-3xl">
            Mengapa Keterbukaan Dana Itu Penting?
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[#2F5F6A] md:text-sm">
            Kasus-kasus nyata di sekitar kita menunjukkan bahwa pengelolaan dana
            yang tertutup mudah memunculkan kecurigaan dan penyalahgunaan.
            SIAGA hadir agar dana lingkungan bisa dipantau oleh seluruh warga.
          </p>
        </div>

        {/* Kartu berita: mobile 1 kolom | tablet & desktop 2 kolom */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md"
            >
              <img
                src={item.gambar}
                alt={`Ilustrasi berita: ${item.judul}`}
                className="aspect-video w-full bg-gray-200 object-cover"
              />

              <div className="flex flex-1 flex-col p-4 md:p-5">
                {/* Sumber & tanggal */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold">
                  <span className="rounded-full bg-[#F4B740]/25 px-2.5 py-0.5 text-[#8A5B00]">
                    {item.sumber}
                  </span>
                  {item.tanggal && <span className="text-gray-500">{item.tanggal}</span>}
                </div>

                <h3 className="mt-3 text-base font-bold leading-snug text-[#0F5A6B] md:text-lg">
                  {item.judul}
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-gray-700">
                  {item.ringkasan}
                </p>

                {/* Kaitan dengan SIAGA */}
                <p className="mt-4 rounded-lg bg-[#13B8A6]/10 px-3 py-2.5 text-xs leading-relaxed text-[#0B5968]">
                  <span className="font-bold">Kaitannya dengan SIAGA: </span>
                  {item.relevansi}
                </p>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 self-start pt-1 text-xs font-bold text-[#0F5A6B] underline-offset-2 transition hover:text-[#F4B740] hover:underline md:mt-auto"
                >
                  Baca selengkapnya di {item.sumber}
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}