import { useState } from 'react'
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react'

const faqs = [
  {
    q: 'Apa itu platform SIAGA dan siapa yang bisa menggunakannya?',
    a: 'SIAGA (Sistem Informasi Aspirasi & Gotong Royong Warga) adalah platform digital terpadu untuk keterbukaan kas lingkungan, pelaporan aduan fasilitas, pemantauan CCTV pos kamling, serta voting musyawarah. Seluruh kepala keluarga (KK) yang terdaftar di lingkungan RT/RW dapat mengaksesnya melalui akun warga.',
  },
  {
    q: 'Bagaimana cara warga membayar iuran bulanan?',
    a: 'Warga cukup login ke dashboard, pilih menu "Iuran & Keuangan", lalu klik "Bayar Iuran". Pembayaran dapat dilakukan otomatis menggunakan Midtrans (QRIS, GoPay, ShopeePay, Virtual Account BCA/BNI/BRI/Mandiri) dengan verifikasi otomatis secara instan, atau melalui transfer bank manual dengan mengunggah bukti struk transfer.',
  },
  {
    q: 'Apakah laporan aduan saya dapat dilihat secara terbuka oleh warga lain?',
    a: 'Ya, aduan fasilitas umum (seperti lampu jalan mati, saluran air mampet, atau jalan rusak) ditampilkan pada dashboard publik dan portal warga agar warga dapat memantau proses tindak lanjutnya secara transparan. Privasi identitas pelapor tetap terlindungi dan diverifikasi oleh sistem.',
  },
  {
    q: 'Bagaimana sistem voting aspirasi 1 KK 1 Suara bekerja?',
    a: 'Setiap agenda musyawarah atau program lingkungan baru dibuka untuk pemungutan suara selama batas waktu tertentu. Setiap kepala keluarga hanya memiliki hak 1 suara sah yang tercatat di database tanpa manipulasi. Warga yang telah menyalurkan suaranya juga mendapatkan poin keaktifan warga teladan.',
  },
  {
    q: 'Bagaimana cara memantau CCTV dan menghubungi kontak darurat?',
    a: 'Tayangan CCTV pos kamling gerbang utama dapat diakses secara publik (view-only) 24 jam dengan opsi kompresi ringan (720p/480p). Selain itu, nomor darurat resmi seperti Polisi (110), Medis/Ambulans (119), Damkar, serta pos jaga kamling dapat langsung dihubungi dengan satu sentuhan panggilan telepon.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx)
  }

  return (
    <section id="faq" className="relative w-full scroll-mt-16 bg-[#F3F4F4]/60 py-14 sm:py-20 md:scroll-mt-[72px] lg:py-24 border-b border-gray-200">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-[110px]">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F5A6B]/20 bg-[#BFE3DA]/40 px-4 py-1.5 text-xs font-bold text-[#0F5A6B] mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-[#0F5A6B]" />
            <span>Pusat Bantuan & Tanya Jawab</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F5A6B] md:text-3xl lg:text-4xl tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#2F5F6A] leading-relaxed">
            Temukan jawaban cepat seputar penggunaan platform SIAGA untuk kemudahan komunikasi dan transparansi hunian Anda.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 sm:mt-14 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition hover:bg-gray-50/60"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-[#0F5A6B] pr-4">
                    {faq.q}
                  </span>
                  <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#0F5A6B] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-[13px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

