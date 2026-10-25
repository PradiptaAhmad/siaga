import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bgHero from "../../assets/img/Hero/BgHero.png";
import gambar1 from "../../assets/img/Hero/gambar1.jpeg";
import gambar2 from "../../assets/img/Hero/gambar2.png";
import gambar3 from "../../assets/img/Hero/gambar3.png";
import icon1 from "../../assets/img/Hero/icon1.png";
import icon2 from "../../assets/img/Hero/icon2.png";
import icon3 from "../../assets/img/Hero/icon3.png";
import icon4 from "../../assets/img/Hero/icon4.png";

const features = [
  { icon: icon1, label: "Transparansi\nKeuangan" },
  { icon: icon2, label: "Aduan\nTerpantau" },
  { icon: icon3, label: "Informasi\nTerupdate" },
  { icon: icon4, label: "Partisipasi\nWarga" },
];

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const targetLink = isAuthenticated
    ? user?.role === "admin"
      ? "/admin"
      : "/user/dashboard"
    : "/login";
  const targetLabel = isAuthenticated ? "Buka Dashboard" : "Login";

  return (
    <section
      id="beranda"
      className="relative w-full scroll-mt-16 overflow-hidden bg-[#F3F4F4] bg-cover bg-top bg-no-repeat md:scroll-mt-[92px] md:min-h-screen md:bg-center"
      style={{ backgroundImage: `url(${bgHero})` }}
    >
      {/* Mobile: 1 kolom | Tablet & Desktop (md ke atas): 2 kolom */}
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-10 md:grid-cols-2 md:gap-8 md:px-10 md:py-20 lg:gap-12 lg:px-[110px] lg:py-24">
        {/* ===== Teks ===== */}
        <div>
          {/* Badge */}
          <span className="inline-block rounded-2xl bg-[#BFE3DA] px-4 py-1.5 text-[10px] font-semibold leading-snug text-[#0F5A6B] md:rounded-full md:text-[11px]">
            🚀 Platform Manajerial Pengurus Organisasi dan Komunitas Warga 🚀
          </span>

          {/* Heading */}
          <h1 className="mt-5 text-[32px] font-extrabold leading-tight text-[#0F5A6B] md:mt-6 md:text-4xl lg:text-[44px]">
            Lingkungan <span className="text-[#F7B538]">Lebih</span>
            <br />
            <span className="text-[#F7B538]">Terbuka</span>,
            <br />
            Warga <span className="text-[#F7B538]">Lebih Berdaya.</span>
          </h1>

          {/* Deskripsi */}
          <p className="mt-3 max-w-md text-sm font-medium text-[#6FAF8F]">
            Platform digital untuk transparansi kas, layanan aduan, keamanan,
            dan partisipasi warga.
          </p>

          {/* Tombol CTA */}
          <div className="mt-8 flex gap-3 md:mt-14 md:gap-4">
            <a
              href="#fitur"
              className="flex-1 rounded-lg bg-[#0F5A6B] py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#0c4756] md:max-w-[165px]"
            >
              Jelajahi SIAGA
            </a>
            <Link
              to={targetLink}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-[#0F5A6B] shadow-md transition hover:bg-gray-50 md:max-w-[165px]"
            >
              {targetLabel}
            </Link>
          </div>

          {/* Kartu fitur */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:flex md:flex-wrap">
            {features.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-md"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                />
                <span className="whitespace-pre-line text-[10px] font-semibold leading-tight text-[#0F5A6B]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Gambar ===== */}
        <div className="flex flex-col gap-3 md:gap-4">
          <img
            src={gambar1}
            alt="Warga bergotong royong"
            className="w-full rounded-lg object-cover shadow-lg"
          />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <img
              src={gambar2}
              alt="Preview dashboard 1"
              className="w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src={gambar3}
              alt="Preview dashboard 2"
              className="w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
