import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react'
import Swal from 'sweetalert2'
import logoUtama from '../assets/img/Hero/logoUtama.png'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [nomorKK, setNomorKK] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFillDemoWarga = () => {
    setNomorKK('3513141508210001')
    setPassword('password123')
  }

  const handleFillDemoAdmin = () => {
    setNomorKK('admin@siaga.id')
    setPassword('password123')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nomorKK || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Belum Lengkap',
        text: 'Silakan isi Nomor Induk Keluarga / Email dan Password.',
        confirmButtonColor: '#0F5A6B',
      })
      return
    }

    setLoading(true)
    try {
      const user = await login(nomorKK, password)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: `Selamat datang kembali, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      })
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/user/dashboard', { replace: true })
      }
    } catch (err) {
      const msg = getErrorMessage(err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: msg || 'Nomor KK/Email atau Password salah.',
        confirmButtonColor: '#0F5A6B',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Mobile: atas-bawah | Tablet & Desktop (md): kiri-kanan
    <main className="flex min-h-screen flex-col font-sans md:flex-row">
      {/* ===== Bagian logo / branding ===== */}
      <section className="flex items-center justify-center bg-[#F5F6F6] px-6 py-10 md:min-h-screen md:w-1/2 md:px-10 md:py-0">
        <div className="flex flex-col items-center text-center">
          <a href="/" aria-label="Kembali ke beranda">
            <img
              src={logoUtama}
              alt="Logo SIAGA - Sistem Informasi Warga"
              className="h-24 w-auto object-contain md:h-36 lg:h-44"
            />
          </a>

          {/* Tagline: hanya tampil di tablet & desktop */}
          <div className="mt-16 hidden md:block lg:mt-24">
            <h1 className="text-3xl font-extrabold leading-tight text-[#0F5A6B] lg:text-4xl">
              Lingkungan <span className="text-[#F7B538]">Lebih</span>
              <br />
              <span className="text-[#F7B538]">Terbuka</span>,
              <br />
              Warga <span className="text-[#F7B538]">Lebih Berdaya.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-xs font-medium text-gray-800">
              Platform digital untuk transparansi kas, layanan aduan,
              keamanan, dan partisipasi warga.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Bagian form login ===== */}
      <section className="flex flex-1 flex-col items-center justify-center bg-[#263A40] px-5 py-10 md:w-1/2 md:flex-none md:px-10">
        <h2 className="text-center text-xl font-bold leading-snug text-white md:text-2xl">
          Selamat Datang
          <br />
          Kembali!
        </h2>

        {/* Demo Fast Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={handleFillDemoWarga}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white border border-white/20 hover:bg-white/20 transition"
          >
            <UserCheck size={12} className="text-[#F7B538]" />
            <span>Akun Demo Warga</span>
          </button>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white border border-white/20 hover:bg-white/20 transition"
          >
            <ShieldCheck size={12} className="text-[#3CC4B0]" />
            <span>Akun Demo Admin RT</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 w-full max-w-md rounded-xl bg-[#F5F6F6] p-5 shadow-lg md:mt-6 md:p-8"
        >
          <h3 className="text-center text-2xl font-bold text-[#0F5A6B]">
            Login
          </h3>

          {/* Nomor KK / Email */}
          <div className="mt-6">
            <label htmlFor="nomorKK" className="sr-only">
              Nomor Induk Keluarga / Email
            </label>
            <input
              id="nomorKK"
              type="text"
              autoComplete="username"
              value={nomorKK}
              onChange={(e) => setNomorKK(e.target.value)}
              placeholder="Nomor Induk Keluarga / Email"
              required
              className="w-full rounded-full border border-[#3CC4B0] bg-white px-4 py-2.5 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#3CC4B0]/40"
            />
          </div>

          {/* Password */}
          <div className="relative mt-4">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-full border border-[#3CC4B0] bg-white py-2.5 pl-4 pr-11 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#3CC4B0]/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 transition hover:text-[#0F5A6B]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              Swal.fire({
                title: 'Lupa Password?',
                text: 'Silakan hubungi pihak pengurus RT untuk mereset kata sandi akun Anda.',
                icon: 'info',
                confirmButtonColor: '#0F5A6B',
              })
            }}
            className="mt-3 inline-block text-[11px] font-bold text-[#0F5A6B] hover:underline"
          >
            Lupa Password?
          </a>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-[#F7B538] py-3 text-sm font-bold text-[#0F4C5C] shadow-md transition hover:bg-[#e5a52c] md:mt-10 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-semibold text-white md:mt-10 md:text-sm">
          Belum Memiliki Akun SIAGA?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              Swal.fire({
                title: 'Pendaftaran Akun Warga',
                text: 'Akun SIAGA didaftarkan langsung oleh pihak RT/RW berdasarkan Kartu Keluarga (KK). Silakan hubungi pengurus RT Anda.',
                icon: 'info',
                confirmButtonColor: '#0F5A6B',
              })
            }}
            className="font-bold underline"
          >
            Hubungi Pihak RT
          </a>
        </p>
      </section>
    </main>
  )
}
