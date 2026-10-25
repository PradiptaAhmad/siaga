import { FileCheck2, Vote, Lock, TrendingUp, CheckCircle2 } from 'lucide-react'

export default function RingkasanSection() {
  const cards = [
    {
      icon: FileCheck2,
      iconBg: 'bg-emerald-100 text-emerald-800',
      title: 'Dari Aduan Menjadi Aksi Nyata',
      desc: 'Keluhan Anda memiliki alur kerja jelas: verifikasi pengurus, penugasan teknisi, hingga dokumentasi foto hasil perbaikan sebelum status dinyatakan selesai.',
      points: [
        'Notifikasi otomatis saat status berubah',
        'Biaya perbaikan terhubung ke kas keluar',
      ],
    },
    {
      icon: Vote,
      iconBg: 'bg-amber-100 text-amber-800',
      title: 'Warga Ikut Menentukan Arah',
      desc: 'Kebijakan pengeluaran iuran dan program tahunan tidak lagi diputuskan sepihak. Kepala keluarga dapat mengajukan usulan dan memberikan suara voting resmi.',
      points: [
        'Pemungutan suara 1 KK 1 Suara transparan',
        'Dukungan warga untuk percepat realisasi',
      ],
    },
    {
      icon: Lock,
      iconBg: 'bg-[#0F5A6B] text-white',
      title: 'Keamanan & Privasi Warga',
      desc: 'Data anggota keluarga dan dokumen administrasi tersimpan dalam enkripsi ketat. Akses CCTV publik diatur sesuai zona hukum lingkungan.',
      points: [
        'Hak akses terisolasi per kepala keluarga',
        'Log audit login & transaksi terlindungi',
      ],
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-[#3CC4B0] text-white',
      title: 'Dampak yang Diwujudkan',
      desc: 'Membangun rasa percaya antarwarga, mendorong kesadaran bayar iuran 100%, dan mewujudkan lingkungan hunian yang tertata serta tanggap darurat.',
      points: [
        'Partisipasi gotong royong meningkat',
        'Poin keaktifan warga teladan',
      ],
    },
  ]

  return (
    <section id="ringkasan" className="relative w-full scroll-mt-16 bg-white py-14 sm:py-20 md:scroll-mt-[72px] lg:py-24 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-[110px]">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F5A6B]">
            Overview Terstruktur
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#0F5A6B] md:text-3xl lg:text-4xl tracking-tight">
            Kekuatan SIAGA untuk Masa Depan Lingkungan
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#2F5F6A] leading-relaxed">
            Menghadirkan keteraturan dan keterbukaan tata kelola RT/RW secara digital, memberdayakan setiap kepala keluarga.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {cards.map((c, idx) => {
            const Icon = c.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-4 ${c.iconBg}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-[#0F5A6B] leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <ul className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 space-y-2 text-xs sm:text-[13px] text-gray-700">
                  {c.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#3CC4B0] shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

