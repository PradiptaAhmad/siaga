import { useEffect, useState } from "react";
import { Camera, Phone, ShieldCheck, AlertTriangle, Radio, Maximize2, X, Clock } from "lucide-react";
import PageBanner from "../../components/user/PageBanner";
import StatCard from "../../components/user/StatCard";
import ChartCard from "../../components/user/ChartCard";
import CctvPlayer from "../../components/security/CctvPlayer";
import api from "../../lib/api";

import iconHeaderKegiatan from "../../assets/img/UserDashboard/StatBulanan.png";
import iconBadge from "../../assets/img/UserDashboard/StatBadge.png";
import iconAduanStat from "../../assets/img/UserDashboard/StatAduan.png";

export default function KeamananPage() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamId, setSelectedCamId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [fullscreenCam, setFullscreenCam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSecurity() {
      try {
        const { data } = await api.get("/security");
        if (data) {
          const cams = Array.isArray(data.cameras) ? data.cameras : [];
          setCameras(cams);
          if (cams.length > 0) {
            setSelectedCamId(cams[0].id);
          }
          const conts = Array.isArray(data.contacts) ? data.contacts : [];
          setContacts(conts);
        }
      } catch (e) {
        console.warn("Gagal memuat data CCTV:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSecurity();
  }, []);

  const selectedCamera = cameras.find((c) => c.id === selectedCamId) || cameras[0];
  const onlineCount = cameras.filter((c) => c.status === "online").length;

  return (
    <div className="space-y-4 md:space-y-5">
      <PageBanner
        title="Keamanan & Pantauan Lingkungan"
        subtitle="Pantau kamera CCTV lingkungan secara live dan akses nomor kontak darurat dengan cepat."
      />

      {/* 3 Stat Card Keamanan */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <StatCard
          icon={iconHeaderKegiatan}
          title="Total Kamera Terpasang"
          subtitle="Titik pantau lingkungan RT 04 / RW 02"
          value={`${cameras.length} Titik CCTV`}
          badge={cameras.length > 0 ? "Aktif Beroperasi" : "Belum Ada"}
          badgeIcon={iconBadge}
        />
        <StatCard
          icon={iconAduanStat}
          title="Kamera Online"
          subtitle="Live stream aktif saat ini"
          value={`${onlineCount} Kamera Online`}
          badge={cameras.length > 0 && onlineCount === cameras.length ? "Semua Online" : "Sebagian Offline"}
          badgeIcon={iconBadge}
        />
        <StatCard
          icon={iconBadge}
          title="Kontak Darurat"
          subtitle="Nomor siaga pengurus & aparat"
          value={`${contacts.length} Nomor Siaga`}
        />
      </section>

      {/* Grid CCTV & Kontak Darurat */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Kolom 1 & 2: CCTV Live Player */}
        <div className="lg:col-span-2 space-y-4">
          <ChartCard
            icon={iconHeaderKegiatan}
            title="Pantauan Kamera CCTV Live"
            subtitle="Pilih kamera untuk memantau area lingkungan secara real-time"
          >
            {/* Pilihan Kamera Tabs */}
            {cameras.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {cameras.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setSelectedCamId(cam.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedCamId === cam.id
                        ? "bg-[#0F5A6B] text-white shadow-md"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        cam.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span>{cam.nama}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Video Player Box */}
            <div className="rounded-xl overflow-hidden bg-black shadow-lg">
              {loading ? (
                <div className="p-16 text-center text-xs text-gray-400">
                  Memuat stream CCTV...
                </div>
              ) : selectedCamera ? (
                <CctvPlayer
                  camera={selectedCamera}
                  onMaximize={() => setFullscreenCam(selectedCamera)}
                />
              ) : (
                <div className="p-16 text-center text-xs text-gray-400">
                  Belum ada kamera CCTV yang aktif atau dikonfigurasi.
                </div>
              )}
            </div>

            {selectedCamera && (
              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <span className="font-semibold text-[#0F5A6B]">
                  📍 Lokasi: {selectedCamera.lokasi || "Lingkungan RT/RW"}
                </span>
                <button
                  type="button"
                  onClick={() => setFullscreenCam(selectedCamera)}
                  className="flex items-center gap-1 font-bold text-[#0F5A6B] hover:underline"
                >
                  <Maximize2 size={13} /> Layar Penuh
                </button>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Kolom 3: Kontak Darurat */}
        <div className="space-y-4">
          <ChartCard
            icon={iconBadge}
            title="Kontak Darurat Cepat"
            subtitle="Hubungi langsung saat terjadi keadaan genting"
          >
            <div className="space-y-2.5 max-h-[34rem] overflow-y-auto pr-1">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Belum ada kontak darurat yang terdaftar.
                </div>
              ) : (
                contacts.map((c) => {
                  const phoneNum = c.telepon || c.nomor || "";
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#26383D] truncate">{c.nama}</p>
                        <p className="text-[10px] font-semibold text-[#0F5A6B]">{c.peran || c.kategori}</p>
                        <p className="font-mono text-xs font-bold text-gray-800 mt-0.5">{phoneNum}</p>
                      </div>
                      <a
                        href={`tel:${phoneNum.replace(/[^0-9]/g, "")}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#13B8A6] text-white shadow hover:bg-[#0f9b8c] transition"
                        title={`Panggil ${c.nama}`}
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Fullscreen CCTV Modal */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-black p-2">
            <button
              type="button"
              onClick={() => setFullscreenCam(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            >
              <X size={20} />
            </button>
            <div className="p-2">
              <h4 className="text-white font-bold text-sm mb-2">{fullscreenCam.nama}</h4>
              <CctvPlayer camera={fullscreenCam} isFullscreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
