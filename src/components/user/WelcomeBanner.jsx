import bgBanner from "../../assets/img/UserDashboard/HeaderBG.png"; // background kuning
import avatarKeluarga from "../../assets/img/UserDashboard/IconFamily.png";
import iconVerified from "../../assets/img/UserDashboard/StatBadge.png";

export default function WelcomeBanner({ nama, nomorKK, status }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[#F4B740] bg-cover bg-right bg-no-repeat px-5 pb-8 pt-5 shadow-md md:px-6 md:pb-12"
      style={{ backgroundImage: `url(${bgBanner})` }}
    >
      <h1 className="text-lg font-bold text-white md:text-xl">
        Selamat Datang Kembali!
      </h1>

      <div className="mt-3 flex items-center gap-4 md:mt-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/30 md:h-16 md:w-16">
          <img src={avatarKeluarga} alt="" className="h-9 w-9 object-contain md:h-10 md:w-10" />
        </div>

        <div className="space-y-0.5 text-[11px] text-white md:text-xs">
          <p>
            Nama Kepala Keluarga: <span className="font-bold">{nama}</span>
          </p>
          <p>
            Nomor Kartu Keluarga: <span className="font-bold">{nomorKK}</span>
          </p>
          <p className="flex items-center gap-1.5">
            Status Akun: <span className="font-bold">{status}</span>
            <img src={iconVerified} alt="" className="h-3.5 w-3.5 object-contain" />
          </p>
        </div>
      </div>
    </section>
  );
}