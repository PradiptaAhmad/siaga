import { useEffect, useState } from "react";
import PageBanner from "../../components/user/PageBanner";
import ChartCard from "../../components/user/ChartCard";
import VotingCard from "../../components/user/VotingCard.jsx";
import VotingModal from "../../components/user/VotingModal";
import KunciVotingModal from "../../components/user/KunciVotingModal";
import PengumumanCard from "../../components/user/PengumumanCard";
import KegiatanChart from "../../components/user/KegiatanChart";
import api, { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

import iconHeaderVoting from "../../assets/img/UserDashboard/iconHeaderVoting.png";
import iconHeaderPengumuman from "../../assets/img/UserDashboard/iconHeaderPengumuman.png";
import iconHeaderGrafik from "../../assets/img/UserDashboard/iconHeaderGrafik.png";

export default function AspirasiPartisipasi() {
  const { user, refreshUser } = useAuth();
  const [polls, setPolls] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [kegiatanAda, setKegiatanAda] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [kegiatanDiikuti, setKegiatanDiikuti] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // modal = { pollId, mode: 'vote' | 'lihat' } | null
  const [modal, setModal] = useState(null);
  const [kunci, setKunci] = useState(null);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    try {
      const [resVotings, resAnnouncements] = await Promise.allSettled([
        api.get("/votings"),
        api.get("/announcements"),
      ]);

      if (resVotings.status === "fulfilled" && resVotings.value?.data?.votings) {
        const rawVotings = resVotings.value.data.votings;
        setPolls(
          rawVotings.map((v) => ({
            id: v.id,
            judul: v.judul,
            deskripsi: v.deskripsi,
            batas: v.deadline ? v.deadline.slice(0, 10) : "",
            status: v.status === "berjalan" ? "Berlangsung" : "Selesai",
            totalWarga: v.total_votes || 0,
            pilihanSaya: v.user_vote?.voting_option_id || null,
            terkunci: Boolean(v.user_voted || v.user_vote),
            options: (v.options || []).map((o) => ({
              id: o.id,
              label: o.nama,
              deskripsi: o.deskripsi,
              votes: o.votes_count || 0,
            })),
          }))
        );
      } else {
        setPolls([]);
      }

      if (resAnnouncements.status === "fulfilled" && resAnnouncements.value?.data?.announcements) {
        const rawAnnounce = resAnnouncements.value.data.announcements;
        setPengumuman(
          rawAnnounce.map((a) => ({
            id: a.id,
            nama: a.judul,
            tanggal: a.tanggal ? a.tanggal.slice(0, 10) : "",
            lokasi: a.lokasi || "Balai Warga SIAGA",
            poin: a.poin || 15,
            rincian: a.isi || a.ringkasan || "-",
            penanggungJawab: a.penulis || "Pengurus RT/RW",
          }))
        );

        // Populate monthly activity distribution
        const monthCounts = Array(12).fill(0);
        rawAnnounce.forEach((a) => {
          if (a.tanggal) {
            const m = parseInt(a.tanggal.slice(5, 7), 10) - 1;
            if (m >= 0 && m < 12) monthCounts[m] += 1;
          }
        });
        setKegiatanAda(monthCounts);
        setKegiatanDiikuti(monthCounts.map((c) => Math.min(c, 1)));
      } else {
        setPengumuman([]);
      }
    } catch (e) {
      console.warn("Gagal memuat voting & pengumuman:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleKunciSuara = async (pollId, optionId) => {
    try {
      await api.post(`/votings/${pollId}/vote`, {
        voting_option_id: optionId,
      });

      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p;
          return {
            ...p,
            pilihanSaya: optionId,
            totalWarga: p.totalWarga + 1,
            terkunci: true,
            options: p.options.map((o) =>
              o.id === optionId ? { ...o, votes: o.votes + 1 } : o
            ),
          };
        })
      );

      Swal.fire({
        icon: "success",
        title: "Suara Terkunci!",
        text: "Terima kasih telah berpartisipasi. Anda mendapatkan +15 Poin Keaktifan Warga.",
        confirmButtonColor: "#0F5A6B",
      });

      if (refreshUser) refreshUser();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Memilih",
        text: getErrorMessage(err) || "Gagal mengirimkan pilihan voting.",
        confirmButtonColor: "#0F5A6B",
      });
    } finally {
      setKunci(null);
      setModal(null);
    }
  };

  const activePoll = modal ? polls.find((p) => p.id === modal.pollId) : null;
  const pollToLock = kunci ? polls.find((p) => p.id === kunci.pollId) : null;
  const optionToLock = pollToLock
    ? pollToLock.options.find((o) => o.id === kunci.optionId)
    : null;

  return (
    <div className="space-y-4 md:space-y-5">
      <PageBanner
        title="Partisipasi & Pengumuman"
        tagline="Suara Anda, Perubahan Bersama."
        subtitle="Ikuti keputusan lingkungan, sampaikan ide, dan pantau hasilnya."
      />

      {/* Toast notifikasi */}
      {toast && (
        <div className="rounded-lg bg-[#0F5A6B] px-4 py-2 text-xs font-semibold text-white shadow-md">
          {toast}
        </div>
      )}

      {/* Mobile bertumpuk | Desktop: voting di kiri, pengumuman + grafik di kanan */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ===== Voting ===== */}
        <ChartCard
          icon={iconHeaderVoting}
          title="Voting & Jajak Pendapat"
          subtitle="Beri suara dan pantau hasil keputusan warga"
        >
          <div className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
            {polls.length === 0 ? (
              <p className="py-10 text-center text-xs text-gray-500">
                Belum ada voting musyawarah yang dibuka saat ini.
              </p>
            ) : (
              polls.map((poll) => (
                <VotingCard
                  key={poll.id}
                  poll={poll}
                  onAction={(pollId, mode) => setModal({ pollId, mode })}
                />
              ))
            )}
          </div>
        </ChartCard>

        {/* ===== Pengumuman + grafik ===== */}
        <div className="flex flex-col gap-4">
          <ChartCard
            icon={iconHeaderPengumuman}
            title="Pengumuman Kegiatan"
            subtitle="Lihat pengumuman kegiatan lingkungan terbaru"
          >
            <div className="max-h-[20rem] space-y-3 overflow-y-auto pr-1">
              {pengumuman.length === 0 ? (
                <p className="py-10 text-center text-xs text-gray-500">
                  Belum ada pengumuman kegiatan warga saat ini.
                </p>
              ) : (
                pengumuman.map((item) => <PengumumanCard key={item.id} {...item} />)
              )}
            </div>
          </ChartCard>

          <ChartCard
            icon={iconHeaderGrafik}
            title="Grafik Kegiatan"
            subtitle="Lihat ringkasan grafik kegiatan yang ada dan yang Anda ikuti"
          >
            <KegiatanChart ada={kegiatanAda} diikuti={kegiatanDiikuti} tahun={new Date().getFullYear()} />
          </ChartCard>
        </div>
      </section>

      {/* ===== Modal voting ===== */}
      {activePoll && (
        <VotingModal
          key={`${activePoll.id}-${modal.mode}`}
          poll={activePoll}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onLanjut={(optionId) => setKunci({ pollId: activePoll.id, optionId })}
        />
      )}

      {/* ===== Modal konfirmasi kunci suara ===== */}
      {kunci && optionToLock && (
        <KunciVotingModal
          poll={pollToLock}
          option={optionToLock}
          onBatal={() => setKunci(null)}
          onKunci={handleKunciSuara}
        />
      )}
    </div>
  );
}
