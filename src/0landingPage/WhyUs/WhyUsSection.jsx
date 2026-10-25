import icon1 from "../../assets/img/Hero/icon1.png";
import icon2 from "../../assets/img/Hero/icon2.png";
import icon3 from "../../assets/img/Hero/icon3.png";
import icon4 from "../../assets/img/Hero/icon4.png";
import bgWhyUs from "../../assets/img/WhyUs/WhyUsBG.png"; // background lingkaran dekoratif

const reasons = [
  {
    icon: icon1,
    title: "Transparansi\nKeuangan",
    desc: "Informasi kas dan riwayat transaksi perlu mudah ditelusuri agar warga memahami bagaimana dana lingkungan dikelola.",
  },
  {
    icon: icon2,
    title: "Aduan yang\nTerpantau",
    desc: "Warga membutuhkan kejelasan status laporan, bukan sekadar mengirim pesan tanpa mengetahui perkembangan tindak lanjutnya.",
  },
  {
    icon: icon3,
    title: "Informasi\nTerpusat",
    desc: "Pengumuman, jadwal kegiatan, dan informasi penting perlu berada dalam satu tempat agar tidak tercecer di berbagai saluran komunikasi.",
  },
  {
    icon: icon4,
    title: "Partisipasi\nWarga",
    desc: "Warga perlu memiliki ruang untuk menyampaikan aspirasi, mengusulkan program, dan ikut menentukan prioritas lingkungan.",
  },
];

export default function WhyUsSection() {
  return (
    <section
      id="tujuan"
      className="relative w-full scroll-mt-16 overflow-hidden bg-white bg-cover bg-top bg-no-repeat md:scroll-mt-[72px] md:min-h-screen md:bg-center"
      style={{ backgroundImage: `url(${bgWhyUs})` }}
    >
      <div className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20 lg:px-[110px] lg:py-24">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#0F5A6B] md:text-3xl">
            Mengapa SIAGA Hadir?
          </h2>

          <h3 className="mt-8 text-sm font-bold text-[#0F5A6B] md:mt-12">
            Lingkungan yang Baik Dimulai dari
            <br className="hidden md:block" /> Keterbukaan.
          </h3>

          <p className="mt-3 text-[13px] leading-relaxed text-[#2F5F6A] md:text-sm">
            Pengelolaan lingkungan bukan hanya tentang menjalankan administrasi,
            tetapi juga membangun kepercayaan antara pengurus dan warga. SIAGA
            hadir untuk menjadikan informasi lebih mudah diakses, aspirasi lebih
            mudah disampaikan, dan setiap proses lebih mudah dipantau.
          </p>
        </div>

        {/* Kartu: mobile 1 kolom | tablet & desktop 4 kolom */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-4">
          {reasons.map((item) => (
            <article
              key={item.title}
              className="flex flex-col items-center rounded-md bg-[#F3F4F4] px-5 py-6 text-center shadow-md md:px-4 lg:px-6 lg:py-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0F4C5C]">
                <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
              </div>

              <h4 className="mt-4 whitespace-pre-line text-[13px] font-bold leading-tight text-[#0F5A6B]">
                {item.title}
              </h4>

              <p className="mt-5 text-[11px] leading-relaxed text-gray-800 md:mt-6 lg:text-xs">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}